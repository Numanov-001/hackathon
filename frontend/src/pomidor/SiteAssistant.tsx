import { Headphones, Send, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { localMarketReply } from "./lib/localReply";
import type { MarketSnapshot } from "./lib/marketSnapshot";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STARTER: ChatMessage = {
  role: "assistant",
  content: "Tanlangan tovar qatorini o‘qiyman: trend, mavsum, oxirgi oy. So‘rang — sayt tahliliga qarab aytaman.",
};

type SiteAssistantProps = {
  snapshot: MarketSnapshot;
};

export default function SiteAssistant({ snapshot }: SiteAssistantProps) {
  const titleId = useId();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER]);
  const listRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) fieldRef.current?.focus();
    else openBtnRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send() {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setText("");
    setBusy(true);
    setError("");
    const local = localMarketReply(content, snapshot);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((item) => item !== STARTER),
          snapshot,
        }),
      });
      const type = response.headers.get("content-type") || "";
      const data = type.includes("application/json")
        ? ((await response.json()) as { reply?: string })
        : {};
      setMessages([...next, { role: "assistant", content: data.reply || local }]);
    } catch {
      setMessages([...next, { role: "assistant", content: local }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
      {open && (
        <section
          className="mb-3 flex h-[min(28rem,70dvh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-overlay"
          aria-labelledby={titleId}
        >
          <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
            <h2 id={titleId} className="text-sm font-semibold text-ink">
              Yordamchi
            </h2>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-[6px] text-muted hover:bg-subtle hover:text-ink"
              onClick={() => setOpen(false)}
              aria-label="Yopish"
            >
              <X size={18} strokeWidth={1.8} />
            </button>
          </header>
          <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3" aria-live="polite">
            {messages.map((item, index) => (
              <p
                key={`${item.role}-${index}`}
                className={
                  item.role === "user"
                    ? "ml-6 rounded-[10px] bg-accent px-3 py-2 text-sm text-on-accent"
                    : "mr-6 rounded-[10px] bg-subtle px-3 py-2 text-sm text-ink"
                }
              >
                {item.content}
              </p>
            ))}
            {busy && <p className="text-[13px] text-muted">Yozilmoqda…</p>}
            {error && <p className="text-[13px] text-bid">{error}</p>}
          </div>
          <form
            className="flex items-end gap-2 border-t border-line p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <label className="sr-only" htmlFor={inputId}>
              Savol
            </label>
            <textarea
              id={inputId}
              ref={fieldRef}
              rows={2}
              maxLength={500}
              value={text}
              disabled={busy}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder="Masalan: pomidor oshayaptimi?"
              className="min-h-11 flex-1 resize-none rounded-[6px] border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] bg-accent text-on-accent hover:bg-accent-hover disabled:opacity-50"
              aria-label="Yuborish"
            >
              <Send size={16} strokeWidth={1.8} />
            </button>
          </form>
        </section>
      )}
      <button
        ref={openBtnRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        aria-label="Yordamchi bilan gaplashish"
        onClick={() => setOpen((value) => !value)}
        className="grid h-14 w-14 place-items-center rounded-full bg-accent text-on-accent shadow-overlay hover:bg-accent-hover"
      >
        {open ? <X size={22} strokeWidth={1.8} /> : <Headphones size={22} strokeWidth={1.8} />}
      </button>
    </div>
  );
}
