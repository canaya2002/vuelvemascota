/**
 * Pipeline de moderación de contenido textual (3 capas):
 *
 *   1. REGLAS LOCALES (gratis, instantáneas) — primer filtro: PII, insultos
 *      obvios, spam, off-topic, enlaces no permitidos.
 *   2. OPENAI MODERATION (gratis) — clasifica odio, violencia, sexual,
 *      self-harm, acoso, etc. Cubre variaciones lingüísticas y contexto.
 *   3. HIVE MODERATION (pago) — red de seguridad final, solo se activa:
 *        - si MODERATION_MODE=strict, o
 *        - el texto es largo (foros/chat con contexto rico), o
 *        - el usuario no tiene historial limpio.
 *
 * La función pública `moderate()` es async. Todos los server actions que la
 * llaman ya están en async → solo añadir `await`.
 *
 * Uso del resultado:
 *  - { ok: true, clean } → texto sanitizado listo para persistir
 *  - { ok: false, reason, detail? } → rechazado con motivo en español
 */

import {
  moderateWithOpenAI,
  moderateTextWithHive,
  moderationEnv,
  type ProviderVerdict,
} from "./moderationProviders";
import { decideTrust, recordClean, recordFlagged } from "./moderationTrust";

export type ModerationContext =
  | "caso"
  | "foro"
  | "chat"
  | "comentario"
  | "avistamiento"
  | "perfil";

export type ModerationResult =
  | { ok: true; clean: string; warnings: string[]; provider?: string }
  | { ok: false; reason: string; detail?: string; provider?: string };

export type ModerationOptions = {
  minLength?: number;
  maxLength?: number;
  requireTopic?: boolean;
  /** Clerk user id o usuario interno — habilita trust scoring. */
  userId?: string | null;
};

/* ============================================================
 * CAPA 1 — reglas locales (versión previa, mantenida tal cual)
 * ============================================================ */

const HARD_BLOCK = [
  // Violencia explícita
  "matar a",
  "asesinar",
  "suicid",
  "violar a",
  "violación",
  // Contenido sexual
  "pornografi",
  "sexo explicito",
  "cp ",
  "menores",
  // Insultos graves
  "pendeja",
  "pendejo",
  "pinche puta",
  "hijo de puta",
  "hdp",
  "maric",
  "joto",
  "puta madre",
  "mierdas",
  "culero",
  "cabron",
  "mamon",
  // Discurso de odio
  "indio naco",
  "negrata",
  "nazi ",
  "supremac",
  // Fraude
  "envia dinero a la cuenta",
  "deposita a esta tarjeta",
  "transfiere a clabe",
  "mándame tu tarjeta",
];

const PII_PATTERNS: RegExp[] = [
  /\b(?:\d[ -]*?){13,19}\b/g, // tarjetas
  /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d\b/g, // CURP
  /\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/g, // RFC
  /\b\d{18}\b/g, // CLABE
  /(contraseña|password|clave secreta)[:=\s]+\S{4,}/gi,
];

const LINK_RE = /\b((?:https?:\/\/|www\.)[^\s<>"']+)/gi;

const SAFE_DOMAINS = [
  "vuelvecasa.com",
  "wa.me",
  "api.whatsapp.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "maps.google.com",
  "goo.gl",
  "maps.app.goo.gl",
];

const TOPIC_SIGNALS = [
  "mascot",
  "perr",
  "gat",
  "cachor",
  "canin",
  "felin",
  "rescat",
  "refugio",
  "albergue",
  "perdid",
  "encontr",
  "avist",
  "vacun",
  "veterinari",
  "esteril",
  "adopc",
  "adopt",
  "callej",
  "hogar temporal",
  "chip",
  "collar",
  "correa",
  "alimento",
  "croqueta",
  "zona",
  "colonia",
  "barrio",
  "extravi",
];

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function extractHost(url: string): string | null {
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isRepetitiveSpam(norm: string) {
  const words = norm.split(/\s+/).filter(Boolean);
  if (words.length < 6) return false;
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const top = [...freq.values()].sort((a, b) => b - a)[0] ?? 0;
  return top / words.length > 0.35;
}

function uppercaseRatio(s: string) {
  const letters = s.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  if (letters.length === 0) return 0;
  const up = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, "");
  return up.length / letters.length;
}

function moderateLocal(
  raw: string,
  context: ModerationContext,
  opts?: ModerationOptions
): ModerationResult {
  const original = String(raw ?? "").trim();
  if (!original) {
    return { ok: false, reason: "El mensaje no puede estar vacío.", provider: "local" };
  }

  const minLength = opts?.minLength ?? 3;
  const maxLength = opts?.maxLength ?? 4000;
  if (original.length < minLength) {
    return {
      ok: false,
      reason: `Escribe al menos ${minLength} caracteres para que sea útil.`,
      provider: "local",
    };
  }
  if (original.length > maxLength) {
    return {
      ok: false,
      reason: `Demasiado largo. Máximo ${maxLength} caracteres.`,
      provider: "local",
    };
  }

  const norm = normalize(original);

  for (const term of HARD_BLOCK) {
    if (norm.includes(normalize(term))) {
      return {
        ok: false,
        reason:
          "Tu mensaje contiene lenguaje o contenido que no permitimos. Reformúlalo enfocándote en la mascota y el rescate.",
        detail: term,
        provider: "local",
      };
    }
  }

  let clean = original;
  for (const re of PII_PATTERNS) {
    clean = clean.replace(re, "███");
  }

  const links = clean.match(LINK_RE) ?? [];
  if (links.length > 3) {
    return {
      ok: false,
      reason:
        "Demasiados enlaces. Incluye como máximo 3 y solo si son indispensables.",
      provider: "local",
    };
  }
  for (const link of links) {
    const host = extractHost(link);
    if (!host) continue;
    const isSafe = SAFE_DOMAINS.some(
      (d) => host === d || host.endsWith("." + d)
    );
    if (!isSafe) {
      return {
        ok: false,
        reason: `Enlaces externos no están permitidos (${host}). Pega la información aquí o usa WhatsApp.`,
        provider: "local",
      };
    }
  }

  let requireTopic: boolean;
  if (opts?.requireTopic !== undefined) {
    requireTopic = opts.requireTopic;
  } else {
    const isCommunity = context === "foro" || context === "chat";
    requireTopic = isCommunity && clean.length > 200;
  }
  const warnings: string[] = [];
  if (requireTopic) {
    const onTopic = TOPIC_SIGNALS.some((s) => norm.includes(s));
    if (!onTopic) {
      return {
        ok: false,
        reason:
          "Este espacio es para temas de mascotas, rescate y comunidad. Reformúlalo enfocándote en eso.",
        provider: "local",
      };
    }
  }

  if (isRepetitiveSpam(norm)) {
    return {
      ok: false,
      reason: "Parece contenido repetitivo o spam. Sé más específico.",
      provider: "local",
    };
  }

  const upperRatio = uppercaseRatio(clean);
  if (clean.length > 40 && upperRatio > 0.6) {
    warnings.push("Evita escribir todo en mayúsculas: se lee como un grito.");
  }

  return { ok: true, clean: clean.trim(), warnings, provider: "local" };
}

/* ============================================================
 * PIPELINE PÚBLICO
 * ============================================================ */

function verdictToResult(
  v: ProviderVerdict,
  cleanText: string,
  warnings: string[]
): ModerationResult {
  if (v.ok) {
    return {
      ok: true,
      clean: cleanText,
      warnings,
      provider: v.provider,
    };
  }
  return {
    ok: false,
    reason: v.reason,
    detail: `${v.category} (${v.score.toFixed(2)})`,
    provider: v.provider,
  };
}

export async function moderate(
  raw: string,
  context: ModerationContext,
  opts?: ModerationOptions
): Promise<ModerationResult> {
  const mode = moderationEnv.mode();

  // CAPA 1 — reglas locales (gratis, rápidas).
  const local = moderateLocal(raw, context, opts);
  if (!local.ok) {
    recordFlagged(opts?.userId);
    return local;
  }

  // CAPA 2 — OpenAI Moderation (gratis). Siempre que haya API key.
  if (mode !== "off" && moderationEnv.openai()) {
    const oa = await moderateWithOpenAI(local.clean);
    if (!oa.ok) {
      recordFlagged(opts?.userId);
      return verdictToResult(oa, local.clean, local.warnings);
    }
  }

  // CAPA 3 — Hive (pago). Gating por trust + longitud.
  if (mode !== "off" && moderationEnv.hive()) {
    const trust = decideTrust(opts?.userId, local.clean.length, mode);
    if (trust.useHive) {
      const hv = await moderateTextWithHive(local.clean);
      if (!hv.ok) {
        recordFlagged(opts?.userId);
        return verdictToResult(hv, local.clean, local.warnings);
      }
    }
  }

  recordClean(opts?.userId);
  return local;
}

/** Versión sincrónica liviana solo para UX en cliente (NO confiar). */
export function previewModeration(
  raw: string,
  context: ModerationContext,
  opts?: ModerationOptions
) {
  return moderateLocal(raw, context, opts);
}

/** Útil para /panel/admin: muestra qué providers están activos. */
export function moderationStatus() {
  return {
    mode: moderationEnv.mode(),
    openai: moderationEnv.openai(),
    hive: moderationEnv.hive(),
  };
}
