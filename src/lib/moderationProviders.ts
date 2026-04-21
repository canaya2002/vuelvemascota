/**
 * Providers de moderación: OpenAI (gratis, texto) + Hive (pago, texto + visual).
 *
 * Cada provider:
 *  - Se activa automáticamente si la API key existe en env.
 *  - Degrada silenciosamente si falta la key (retorna { ok: true } → no bloquea).
 *  - Timeout agresivo (5s) para no colgar el server action si el provider cae.
 *
 * Diseño anti-costo:
 *  - OpenAI siempre primero: es GRATIS y cubre ~90% de abusos de texto.
 *  - Hive solo se llama cuando:
 *      a) MODERATION_MODE=strict, o
 *      b) El texto supera cierta longitud (contenido largo = más riesgo), o
 *      c) El usuario NO es de confianza (sin historial limpio).
 *  - Imágenes pasan por hash cache antes de Hive (evita pagar 2 veces la misma foto).
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
  hive: () => envFlag("HIVE_API_KEY"),
  mode: (): "auto" | "strict" | "off" => {
    const m = (process.env.MODERATION_MODE ?? "auto").toLowerCase();
    return m === "strict" || m === "off" ? m : "auto";
  },
  openaiThreshold: () =>
    Math.max(0.1, Math.min(0.99, Number(process.env.OPENAI_THRESHOLD ?? "0.5"))),
  hiveThreshold: () =>
    Math.max(0.1, Math.min(0.99, Number(process.env.HIVE_THRESHOLD ?? "0.8"))),
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

/**
 * Etiquetas en español para cada categoría del endpoint omni.
 * Las traducimos al devolver razón para que el usuario entienda.
 */
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
    const flagged =
      r.flagged || (worst && worst.s >= threshold);

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
 * Hive Moderation — text + visual (paid)
 * https://docs.thehive.ai/reference
 *
 * Endpoint sync: POST https://api.thehive.ai/api/v2/task/sync
 * Auth: Authorization: Token <HIVE_API_KEY>
 * Body (texto): application/x-www-form-urlencoded con text_data=<texto>
 * Body (imagen): multipart/form-data con image=<bytes> O image_url=<URL>
 * ============================================================ */

type HiveClass = { class: string; score: number };
type HiveOutput = { classes?: HiveClass[] };
type HiveResponse = {
  status?: Array<{
    status?: { code?: string };
    response?: { output?: HiveOutput[] };
  }>;
};

/**
 * Clases de Hive que consideramos bloqueo (NSFW / violencia / abuso).
 * La lista cubre los prefijos comunes del modelo "text-moderation" y
 * "visual-content-moderation" — cualquier clase que empiece con uno de
 * estos prefijos con score > umbral se considera positivo.
 */
const HIVE_BLOCK_PREFIXES: Record<string, string> = {
  yes_nsfw: "contenido sexual",
  yes_sexual: "contenido sexual",
  yes_gore: "contenido gráfico violento",
  yes_violence: "violencia",
  yes_hate: "discurso de odio",
  yes_harassment: "acoso",
  yes_bullying: "acoso/bullying",
  yes_self_harm: "autolesión",
  yes_drug: "promoción de drogas ilícitas",
  yes_weapon: "armas / violencia",
  yes_child_exploitation: "explotación infantil",
  yes_scam: "fraude",
};

function evaluateHiveClasses(
  classes: HiveClass[],
  threshold: number
): { hit: HiveClass; label: string } | null {
  for (const c of classes) {
    if (c.score < threshold) continue;
    for (const [pref, label] of Object.entries(HIVE_BLOCK_PREFIXES)) {
      if (c.class.startsWith(pref)) return { hit: c, label };
    }
  }
  return null;
}

export async function moderateTextWithHive(
  text: string
): Promise<ProviderVerdict> {
  if (!moderationEnv.hive()) {
    return { ok: true, provider: "hive-text", skipped: true };
  }
  try {
    const form = new URLSearchParams();
    form.set("text_data", text.slice(0, 4000));
    const res = await fetchWithTimeout("https://api.thehive.ai/api/v2/task/sync", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.HIVE_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    if (!res.ok) {
      console.warn("[moderation:hive-text] non-200", res.status);
      return { ok: true, provider: "hive-text", skipped: true };
    }
    const data = (await res.json()) as HiveResponse;
    const classes =
      data.status?.[0]?.response?.output?.[0]?.classes ?? [];
    const hit = evaluateHiveClasses(classes, moderationEnv.hiveThreshold());
    if (hit) {
      return {
        ok: false,
        provider: "hive-text",
        category: hit.hit.class,
        score: hit.hit.score,
        reason: `Detectamos ${hit.label} en tu mensaje. Ajústalo para que cumpla con las normas de la comunidad.`,
      };
    }
    return { ok: true, provider: "hive-text" };
  } catch (err) {
    console.warn(
      "[moderation:hive-text] error",
      err instanceof Error ? err.message : err
    );
    return { ok: true, provider: "hive-text", skipped: true };
  }
}

/**
 * Hive visual moderation.
 * Acepta bytes (preferido, para imágenes recién subidas) o URL pública.
 * Siempre enviamos bytes para ahorrarle a Hive el download y porque la imagen
 * puede aún no ser pública (moderación preventiva antes de aceptar).
 */
export async function moderateImageWithHive(
  bytes: Uint8Array,
  mime: string
): Promise<ProviderVerdict> {
  if (!moderationEnv.hive()) {
    return { ok: true, provider: "hive-visual", skipped: true };
  }
  try {
    const form = new FormData();
    // Blob es soportado por fetch() en Node 20+.
    form.set("image", new Blob([bytes as BlobPart], { type: mime || "image/jpeg" }));
    const res = await fetchWithTimeout(
      "https://api.thehive.ai/api/v2/task/sync",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.HIVE_API_KEY}`,
          // Content-Type lo pone fetch automáticamente con el boundary correcto.
        },
        body: form,
      },
      10_000 // imágenes pueden tardar más
    );
    if (!res.ok) {
      console.warn("[moderation:hive-visual] non-200", res.status);
      return { ok: true, provider: "hive-visual", skipped: true };
    }
    const data = (await res.json()) as HiveResponse;
    const classes =
      data.status?.[0]?.response?.output?.[0]?.classes ?? [];
    const hit = evaluateHiveClasses(classes, moderationEnv.hiveThreshold());
    if (hit) {
      return {
        ok: false,
        provider: "hive-visual",
        category: hit.hit.class,
        score: hit.hit.score,
        reason: `La imagen contiene ${hit.label}. Súbela solo si respeta las normas de la comunidad.`,
      };
    }
    return { ok: true, provider: "hive-visual" };
  } catch (err) {
    console.warn(
      "[moderation:hive-visual] error",
      err instanceof Error ? err.message : err
    );
    return { ok: true, provider: "hive-visual", skipped: true };
  }
}

/**
 * Resumen de estado de providers para logging al boot.
 */
export function summarizeModerationEnv(): string {
  const parts = [
    `mode=${moderationEnv.mode()}`,
    `openai=${moderationEnv.openai() ? "on" : "off"}`,
    `hive=${moderationEnv.hive() ? "on" : "off"}`,
  ];
  return parts.join(" · ");
}
