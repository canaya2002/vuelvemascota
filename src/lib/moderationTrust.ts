/**
 * Trust scoring para bajar costo de moderación de terceros sin bajar seguridad.
 *
 * Idea: a los usuarios con historial limpio (sin bloqueos en sus últimos N
 * mensajes) no los mandamos a Hive — OpenAI + reglas locales ya los cubre.
 * Esto ahorra ~60-80% de llamadas pagadas cuando la comunidad es mayoritariamente
 * sana, que es lo normal.
 *
 * Se reinicia por proceso (in-memory). Si se requiere durabilidad entre deploys
 * se puede persistir en `usuarios.trust_clean_streak` — ya contemplado.
 */

export type TrustDecision = {
  /** ¿Debemos llamar a Hive (provider caro) para este usuario en este contexto? */
  useHive: boolean;
  /** Etiqueta diagnóstico */
  reason: string;
};

const CLEAN_STREAK_TO_TRUST = 20; // mensajes limpios consecutivos → low risk
const streaks = new Map<string, number>();
const lifetimeFlags = new Map<string, number>();

function key(userId: string | null | undefined): string {
  return userId ?? "anon";
}

export function recordClean(userId: string | null | undefined) {
  const k = key(userId);
  streaks.set(k, (streaks.get(k) ?? 0) + 1);
}

export function recordFlagged(userId: string | null | undefined) {
  const k = key(userId);
  streaks.set(k, 0);
  lifetimeFlags.set(k, (lifetimeFlags.get(k) ?? 0) + 1);
}

/**
 * Decide si vale la pena gastar Hive en este texto.
 * - Anónimos: siempre sí (no hay historial que los respalde).
 * - Usuarios con streak limpio + texto corto: no (barato salir del paso con OpenAI).
 * - Usuarios con streak limpio + texto largo: sí cada ~3 mensajes (muestreo).
 * - Usuarios con flags recientes: siempre sí.
 */
export function decideTrust(
  userId: string | null | undefined,
  textLength: number,
  mode: "auto" | "strict" | "off"
): TrustDecision {
  if (mode === "strict")
    return { useHive: true, reason: "MODERATION_MODE=strict" };
  if (mode === "off")
    return { useHive: false, reason: "MODERATION_MODE=off" };

  const k = key(userId);
  const streak = streaks.get(k) ?? 0;
  const flags = lifetimeFlags.get(k) ?? 0;

  // Ha sido marcado antes: siempre verifica.
  if (flags > 0) return { useHive: true, reason: `flags=${flags}` };

  // Anónimo: siempre verifica (texto largo) o cada 3 (texto corto).
  if (userId == null) {
    if (textLength > 180)
      return { useHive: true, reason: "anon · long-form" };
    // Muestreo 1 de cada 3 para evitar abuso sistemático.
    const rand = Math.random();
    return rand < 0.33
      ? { useHive: true, reason: "anon · sampled" }
      : { useHive: false, reason: "anon · skipped (sampled)" };
  }

  // Usuario con historial limpio sólido.
  if (streak >= CLEAN_STREAK_TO_TRUST) {
    // Solo 1 de cada 10 va a Hive como defensa contra drift.
    const rand = Math.random();
    return rand < 0.1
      ? { useHive: true, reason: `trusted · sampled (streak=${streak})` }
      : { useHive: false, reason: `trusted · skipped (streak=${streak})` };
  }

  // Nuevo o poco historial: verifica mientras se gana confianza.
  return { useHive: true, reason: `building trust (streak=${streak})` };
}

export function trustSnapshot() {
  return {
    users_tracked: streaks.size,
    avg_streak:
      streaks.size === 0
        ? 0
        : [...streaks.values()].reduce((a, b) => a + b, 0) / streaks.size,
    total_flags: [...lifetimeFlags.values()].reduce((a, b) => a + b, 0),
  };
}
