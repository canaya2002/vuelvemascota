/**
 * Formatters ligeros. Usamos Intl.DateTimeFormat nativo en lugar de date-fns
 * para evitar deps extras — RN expone Intl con locale `es-MX` out of the box
 * desde Expo SDK 53.
 */

const dateFmt = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("es-MX", {
  hour: "numeric",
  minute: "2-digit",
});

export function fmtDate(iso: string): string {
  try {
    return dateFmt.format(new Date(iso));
  } catch {
    return iso;
  }
}

export function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${dateFmt.format(d)} · ${timeFmt.format(d)}`;
  } catch {
    return iso;
  }
}

export function relativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const secs = Math.floor((now - then) / 1000);
    if (secs < 60) return "hace instantes";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days} d`;
    return fmtDate(iso);
  } catch {
    return iso;
  }
}

export function fmtMoneyMXN(n: number): string {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n}`;
  }
}
