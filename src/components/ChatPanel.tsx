"use client";
import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { postChatAction, type ForoActionState } from "@/lib/foroActions";
import type { ChatCanal, ChatMensaje } from "@/lib/chat";
import { TextArea } from "./forms/Field";
import { IconArrow, IconPaw } from "./Icons";

const initial: ForoActionState = { ok: false, message: "" };

export function ChatPanel({
  canal,
  mensajes,
}: {
  canal: ChatCanal;
  mensajes: ChatMensaje[];
}) {
  const [state, formAction] = useActionState(postChatAction, initial);
  const [cuerpo, setCuerpo] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes.length]);

  return (
    <div className="vc-card-glass !p-0 overflow-hidden flex flex-col">
      <div
        ref={scrollRef}
        className="h-[500px] md:h-[580px] overflow-y-auto p-5 md:p-6 space-y-4 bg-white"
      >
        {mensajes.length === 0 ? (
          <EmptyChat />
        ) : (
          mensajes.map((m, i) => {
            const prev = mensajes[i - 1];
            const showDateSep =
              !prev ||
              new Date(prev.created_at).toDateString() !==
                new Date(m.created_at).toDateString();
            return (
              <div key={m.id}>
                {showDateSep && <DateSeparator date={m.created_at} />}
                <ChatBubble m={m} />
              </div>
            );
          })
        )}
      </div>

      <form
        action={async (fd) => {
          await formAction(fd);
          setCuerpo("");
        }}
        className="border-t border-[var(--line)] p-4 md:p-5 bg-[var(--bg-alt)]"
      >
        <input type="hidden" name="canal" value={canal} />
        <TextArea
          label="Tu mensaje"
          name="cuerpo"
          rows={3}
          placeholder="Escribe algo útil y respetuoso…"
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          maxLength={800}
        />
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-[var(--muted)] flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[var(--line)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Moderado
            </span>
            <span className="hidden sm:inline">
              {cuerpo.length}/800 caracteres
            </span>
          </p>
          <Submit />
        </div>
        {state.message && (
          <p
            className={`mt-3 text-sm ${
              state.ok ? "text-[var(--accent)]" : "text-[var(--brand-ink)]"
            }`}
            aria-live="polite"
          >
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="h-full flex items-center justify-center text-center">
      <div className="max-w-sm">
        <span className="inline-flex w-16 h-16 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center mx-auto">
          <IconPaw size={28} />
        </span>
        <p className="mt-5 text-lg font-semibold text-[var(--ink)]">
          Nadie ha escrito todavía.
        </p>
        <p className="mt-2 text-[var(--ink-soft)] text-sm">
          Rompe el hielo: pregunta, ofrece ayuda o comparte una pista. La
          comunidad suele responder en minutos.
        </p>
        <ul className="mt-5 text-left text-sm text-[var(--ink-soft)] space-y-2">
          <li>
            💬 &ldquo;¿Hay algún rescatista en [zona] que pueda ir a revisar un
            avistamiento?&rdquo;
          </li>
          <li>
            🐾 &ldquo;Encontré un gato con collar en [colonia], buscando
            dueño&rdquo;
          </li>
          <li>
            🩺 &ldquo;¿Alguien conoce vet 24h con consulta accesible?&rdquo;
          </li>
        </ul>
      </div>
    </div>
  );
}

function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const label = isToday
    ? "Hoy"
    : isYesterday
    ? "Ayer"
    : d.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  return (
    <div className="flex items-center gap-3 my-4" aria-label={label}>
      <span className="h-px flex-1 bg-[var(--line)]" />
      <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--muted)]">
        {label}
      </span>
      <span className="h-px flex-1 bg-[var(--line)]" />
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMensaje }) {
  const initials = (m.autor_nombre ?? "VC")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-start gap-3 group">
      <span
        aria-hidden
        className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-[var(--brand)] to-[#f472b6]"
      >
        {initials}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--ink)] truncate">
            {m.autor_nombre ?? "Comunidad"}
          </p>
          <span className="text-[11px] text-[var(--muted)] whitespace-nowrap">
            {formatTime(m.created_at)}
          </span>
        </div>
        <div className="mt-1 rounded-2xl bg-white border border-[var(--line)] px-4 py-2.5 shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">
            {m.cuerpo}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return d.toLocaleString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-primary text-sm !py-2.5 !px-4"
    >
      {pending ? "Enviando…" : "Enviar"} <IconArrow size={14} />
    </button>
  );
}
