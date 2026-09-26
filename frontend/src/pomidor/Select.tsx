import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "./lib/cn";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  "aria-label"?: string;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Tanlang",
  searchable = false,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = options.find((item) => item.value === value);
  const filtered = options.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const box = root.current?.getBoundingClientRect();
    const scroller = root.current?.closest("[data-scroll-panel]") ?? root.current?.closest("[role='dialog']");
    const limit = scroller?.getBoundingClientRect().bottom ?? window.innerHeight - 16;
    const shouldUp = box ? limit - box.bottom < 220 : false;
    setDropUp(shouldUp);
    if (searchable) {
      setQuery("");
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
    window.requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [open, searchable]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className={cn("relative", open && "z-30")} ref={root}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-[6px] border border-line bg-surface px-3 text-left text-sm text-ink outline-none transition-colors duration-150 focus:border-accent",
          open && "border-accent",
          className,
        )}
      >
        <span className={cn("truncate", !selected && "text-muted")}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} strokeWidth={1.8} className={cn("shrink-0 text-muted transition-transform duration-150", open && "rotate-180")} />
      </button>
      {open && (
        <div
          ref={listRef}
          className={cn(
            "absolute z-30 w-full overflow-hidden rounded-[10px] border border-line bg-surface p-1.5 shadow-overlay",
            dropUp ? "bottom-full mb-1.5 menu-in-up" : "top-full mt-1.5 menu-in",
          )}
        >
          {searchable && (
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Qidirish"
              className="mb-1 h-10 w-full rounded-[6px] border border-line px-3 text-sm outline-none focus:border-accent"
            />
          )}
          <ul id={listId} role="listbox" className="max-h-48 overflow-auto">
            {filtered.map((item) => {
              const active = item.value === value;
              return (
                <li key={item.value || "all"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pick(item.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-[6px] px-3 py-2.5 text-left text-sm",
                      active ? "bg-soft font-semibold text-accent" : "text-ink hover:bg-subtle",
                    )}
                  >
                    {item.label}
                    {active && <Check size={16} strokeWidth={2} />}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && <li className="px-3 py-3 text-sm text-muted">Mos qator yo‘q</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
