/**
 * Providers de moderación: OpenAI (gratis, texto) + Azure Content Safety
 * (pago, texto + visual).
 *
 * Cada provider:
 *  - Se activa automáticamente si la API key existe en env.
 *  - Degrada silenciosamente si falta la key (retorna { ok: true } → no bloquea).
 *  - Timeout agresivo para no colgar el server action si el provider cae.
 *
 * Diseño anti-costo:
 *  - OpenAI siempre primero: GRATIS, cubre ~85-90% de abusos de texto.
 *  - Azure Content Safety solo se llama cuando:
 *      a) MODERATION_MODE=strict, o
 *      b) El texto es largo (contenido largo = más riesgo), o
 *      c) El usuario NO es de confianza (sin historial limpio).
 *  - Imágenes: cache por hash antes de Azure; además el cliente ya las
 *    comprime a <= 4 MB (límite de Azure).
 *
 * Docs Azure:
 *  https://learn.microsoft.com/azure/ai-services/content-safety/
 */

export type ProviderVerdict =
  | { ok: true; provider: string; skipped?: boolean }
  | {
      ok: false;
      provider: string;
      category: string;
      score: number;
      reason: string;
    };

const TIMEOUT_MS = 5000;

function envFlag(name: string): boolean {
  return !!process.env[name] && process.env[name]!.length > 5;
}

export const moderationEnv = {
  openai: () => envFlag("OPENAI_API_KEY"),
  azure: () =>
    envFlag("AZURE_CONTENT_SAFETY_KEY") &&
    envFlag("AZURE_CONTENT_SAFETY_ENDPOINT"),
  mode: (): "auto" | "strict" | "off" => {
    const m = (process.env.MODERATION_MODE ?? "auto").toLowerCase();
    return m === "strict" || m === "off" ? m : "auto";
  },
  openaiThreshold: () =>
    Math.max(0.1, Math.min(0.99, Number(process.env.OPENAI_THRESHOLD ?? "0.5"))),
  /**
   * Azure severity: 0 (safe) · 2 (low) · 4 (medium) · 6 (high).
   * Por defecto bloqueamos desde 4. Ajusta con AZURE_SEVERITY_THRESHOLD.
   */
  azureThreshold: () =>
    Math.max(
      2,
      Math.min(6, Number(process.env.AZURE_SEVERITY_THRESHOLD ?? "4"))
    ),
};

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = TIMEOUT_MS
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/* ============================================================
 * OpenAI Moderation — free, omni-moderation-latest
 * https://platform.openai.com/docs/guides/moderation
 * ============================================================ */

type OpenAIModerationResponse = {
  id: string;
  model: string;
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }>;
};

const OPENAI_LABELS: Record<string, string> = {
  sexual: "contenido sexual",
  "sexual/minors": "contenido sexual con menores",
  harassment: "acoso",
  "harassment/threatening": "amenaza o acoso",
  hate: "discurso de odio",
  "hate/threatening": "amenaza por odio",
  illicit: "actividad ilícita",
  "illicit/violent": "actividad ilícita violenta",
  "self-harm": "autolesión",
  "self-harm/intent": "intención de autolesión",
  "self-harm/instructions": "instrucciones de autolesión",
  violence: "violencia",
  "violence/graphic": "violencia explícita",
};

export async function moderateWithOpenAI(
  text: string
): Promise<ProviderVerdict> {
  if (!moderationEnv.openai()) {
    return { ok: true, provider: "openai", skipped: true };
  }
  try {
    const res = await fetchWithTimeout(
      "https://api.openai.com/v1/moderations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "omni-moderation-latest",
          input: text.slice(0, 4000),
        }),
      }
    );
    if (!res.ok) {
      console.warn("[moderation:openai] non-200", res.status);
      return { ok: true, provider: "openai", skipped: true };
    }
    const data = (await res.json()) as OpenAIModerationResponse;
    const r = data.results[0];
    if (!r) return { ok: true, provider: "openai", skipped: true };

    const threshold = moderationEnv.openaiThreshold();
    let worst: { k: string; s: number } | null = null;
    for (const [k, s] of Object.entries(r.category_scores)) {
      if (typeof s === "number" && (!worst || s > worst.s)) {
        worst = { k, s };
      }
    }
    const flagged = r.flagged || (worst && worst.s >= threshold);

    if (flagged && worst) {
      return {
        ok: false,
        provider: "openai",
        category: worst.k,
        score: worst.s,
        reason: `Contenido con ${
          OPENAI_LABELS[worst.k] ?? worst.k
        }. Ajusta el mensaje para que cumpla con las normas.`,
      };
    }
    return { ok: true, provider: "openai" };
  } catch (err) {
    console.warn(
      "[moderation:openai] error",
      err instanceof Error ? err.message : err
    );
    return { ok: true, provider: "openai", skipped: true };
  }
}

/* ============================================================
 * Azure Content Safety — text + image (paid pay-as-you-go)
 *
 * Endpoints (API 2024-09-01):
 *   POST {endpoint}/contentsafety/text:analyze?api-version=2024-09-01
 *   POST {endpoint}/contentsafety/image:analyze?api-version=2024-09-01
 * Auth: header "Ocp-Apim-Subscription-Key: <KEY>"
 *
 * Las 4 categorías soportadas son Hate, SelfHarm, Sexual, Violence.
 * Severity va de 0 (safe) a 6 (high). Bloqueamos cuando >= threshold (def 4).
 * ============================================================ */

type AzureAnalysis = {
  categoriesAnalysis?: Array<{
    category: string;
    severity: number;
  }>;
  blocklistsMatch?: Array<{ blocklistName: string; blockItemId: string }>;
};

const AZURE_LABELS: Record<string, string> = {
  Hate: "discurso de odio",
  SelfHarm: "autolesión o suicidio",
  Sexual: "contenido sexual",
  Violence: "violencia",
};

function azureUrl(path: string): string {
  const base = (process.env.AZURE_CONTENT_SAFETY_ENDPOINT ?? "").replace(
    /\/$/,
    ""
  );
  return `${base}/contentsafety/${path}?api-version=2024-09-01`;
}

function evaluateAzure(
  analysis: AzureAnalysis,
  threshold: number
): { category: string; severity: number } | null {
  const cats = analysis.categoriesAnalysis ?? [];
  let worst: { category: string; severity: number } | null = null;
  for (const c of cats) {
    if (typeof c.severity === "number" && c.severity >= threshold) {
      if (!worst || c.severity > worst.severity) {
        worst = { category: c.category, severity: c.severity };
      }
    }
  }
  if (!worst && analysis.blocklistsMatch && analysis.blocklistsMatch.length > 0) {
    return { category: "Blocklist", severity: 6 };
  }
  return worst;
}

export async function moderateTextWithAzure(
  text: string
): Promise<ProviderVerdict> {
  if (!moderationEnv.azure()) {
    return { ok: true, provider: "azure-text", skipped: true };
  }
  try {
    const res = await fetchWithTimeout(azureUrl("text:analyze"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.AZURE_CONTENT_SAFETY_KEY!,
      },
      body: JSON.stringify({
        text: text.slice(0, 10000),
        categories: ["Hate", "SelfHarm", "Sexual", "Violence"],
        outputType: "FourSeverityLevels",
      }),
    });
    if (!res.ok) {
      console.warn("[moderation:azure-text] non-200", res.status);
      return { ok: true, provider: "azure-text", skipped: true };
    }
    const data = (await res.json()) as AzureAnalysis;
    const hit = evaluateAzure(data, moderationEnv.azureThreshold());
    if (hit) {
      return {
        ok: false,
        provider: "azure-text",
        category: hit.category,
        score: hit.severity / 6,
        reason: `Detectamos ${
          AZURE_LABELS[hit.category] ?? hit.category.toLowerCase()
        } (severidad ${hit.severity}/6). Reformula el mensaje para que cumpla con las normas.`,
      };
    }
    return { ok: true, provider: "azure-text" };
  } catch (err) {
    console.warn(
      "[moderation:azure-text] error",
      err instanceof Error ? err.message : err
    );
    return { ok: true, provider: "azure-text", skipped: true };
  }
}

/**
 * Azure image:analyze acepta base64 o URL pública. Usamos base64 porque
 * la imagen puede aún no ser pública (moderación preventiva antes del
 * upload a Supabase). Límite de Azure: 4 MB por imagen, <= 7200×7200 px.
 * El cliente comprime antes, pero igual revisamos el tamaño por seguridad.
 */
const AZURE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export async function moderateImageWithAzure(
  bytes: Uint8Array,
  mime: string
): Promise<ProviderVerdict> {
  if (!moderationEnv.azure()) {
    return { ok: true, provider: "azure-visual", skipped: true };
  }
  if (bytes.byteLength > AZURE_IMAGE_MAX_BYTES) {
    // Evita pagar una llamada que Azure va a rechazar por tamaño.
    console.warn(
      "[moderation:azure-visual] skipped · over 4MB:",
      bytes.byteLength
    );
    return { ok: true, provider: "azure-visual", skipped: true };
  }
  void mime;
  try {
    const base64 = Buffer.from(bytes).toString("base64");
    const res = await fetchWithTimeout(
      azureUrl("image:analyze"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.AZURE_CONTENT_SAFETY_KEY!,
        },
        body: JSON.stringify({
          image: { content: base64 },
          categories: ["Hate", "SelfHarm", "Sexual", "Violence"],
          outputType: "FourSeverityLevels",
        }),
      },
      10_000 // imágenes pueden tardar más
    );
    if (!res.ok) {
      console.warn("[moderation:azure-visual] non-200", res.status);
      return { ok: true, provider: "azure-visual", skipped: true };
    }
    const data = (await res.json()) as AzureAnalysis;
    const hit = evaluateAzure(data, moderationEnv.azureThreshold());
    if (hit) {
      return {
        ok: false,
        provider: "azure-visual",
        category: hit.category,
        score: hit.severity / 6,
        reason: `La imagen contiene ${
          AZURE_LABELS[hit.category] ?? hit.category.toLowerCase()
        } (severidad ${hit.severity}/6). Súbela solo si respeta las normas.`,
      };
    }
    return { ok: true, provider: "azure-visual" };
  } catch (err) {
    console.warn(
      "[moderation:azure-visual] error",
      err instanceof Error ? err.message : err
    );
    return { ok: true, provider: "azure-visual", skipped: true };
  }
}

/**
 * Resumen de estado de providers para logging al boot.
 */
export function summarizeModerationEnv(): string {
  const parts = [
    `mode=${moderationEnv.mode()}`,
    `openai=${moderationEnv.openai() ? "on" : "off"}`,
    `azure=${moderationEnv.azure() ? "on" : "off"}`,
  ];
  return parts.join(" · ");
}
