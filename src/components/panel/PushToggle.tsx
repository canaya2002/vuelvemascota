"use client";
import { useEffect, useState } from "react";
import { IconBell, IconCheck } from "../Icons";

function urlBase64ToBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

function readInitialSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function PushToggle() {
  const [supported] = useState<boolean>(readInitialSupported);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {
        /* ignore */
      });
  }, [supported]);

  async function subscribe() {
    setMsg(null);
    if (!vapidKey) {
      setMsg("Notificaciones push aún no están configuradas.");
      return;
    }
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToBuffer(vapidKey),
      });
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubscribed(true);
      setMsg("¡Listo! Te avisaremos aquí cuando haya casos cerca.");
    } catch (err) {
      console.error(err);
      setMsg(
        "No pudimos activar las notificaciones. Revisa permisos del navegador."
      );
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setMsg(null);
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMsg("Notificaciones desactivadas.");
    } catch {
      setMsg("Hubo un problema al desactivar.");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <div className="vc-card bg-[var(--bg-alt)]">
        <p className="text-sm text-[var(--ink-soft)]">
          Tu navegador no soporta notificaciones push web. En iOS, instala la app desde el menú compartir para habilitarlas.
        </p>
      </div>
    );
  }

  return (
    <div className="vc-card">
      <div className="flex items-start gap-3">
        <span
          className={`w-10 h-10 rounded-full inline-flex items-center justify-center ${
            subscribed
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
          }`}
        >
          {subscribed ? <IconCheck size={20} /> : <IconBell size={20} />}
        </span>
        <div className="flex-1">
          <h3 className="font-semibold">Notificaciones push al navegador</h3>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Recibe un aviso inmediato cuando entre un caso a tu zona, incluso con el celular bloqueado.
          </p>
          <div className="mt-3">
            {subscribed ? (
              <button
                type="button"
                onClick={unsubscribe}
                disabled={loading}
                className="vc-btn vc-btn-outline text-sm"
              >
                {loading ? "Desactivando…" : "Desactivar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={subscribe}
                disabled={loading}
                className="vc-btn vc-btn-primary text-sm"
              >
                {loading ? "Activando…" : "Activar notificaciones"}
              </button>
            )}
          </div>
          {msg && (
            <p className="text-xs text-[var(--ink-soft)] mt-2" aria-live="polite">
              {msg}
            </p>
          )}
          {!vapidKey && (
            <p className="text-xs text-[var(--muted)] mt-2">
              Listo para activarse: cuando agregues <code>NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> la comunidad podrá suscribirse.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
