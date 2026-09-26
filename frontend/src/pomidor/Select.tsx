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
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = options.find((item) => item.value === value);
  const filtered = options.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open && searchable) {
      setQuery("");
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open, searchable]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-[10px] border bg-white px-3 text-left text-sm outline-none transition-all duration-150",
          "h-12 border-[#E4E7EC] text-[#14213D]",
          "focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12",
          open && "border-[#16A05D] ring-[3px] ring-[#16A05D]/12",
          className,
        )}
      >
        <span className={selected ? "truncate" : "truncate text-[#667085]"}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} strokeWidth={1.8} className={cn("shrink-0 text-[#667085] transition-transform duration-150", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white p-1.5 shadow-[0_12px_32px_rgba(16,24,40,0.10)]">
          {searchable && (
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Qidirish"
              className="mb-1 h-10 w-full rounded-xl border border-[#E4E7EC] px-3 text-sm outline-none focus:border-[#16A05D]"
            />
          )}
          <ul id={listId} role="listbox" className="max-h-64 overflow-auto">
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
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150",
                      active ? "bg-[#EAF8F0] font-semibold text-[#087A45]" : "text-[#14213D] hover:bg-[#F5FBF7]",
                    )}
                  >
                    {item.label}
                    {active && <Check size={16} strokeWidth={2} />}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && <li className="px-3 py-3 text-sm text-[#667085]">Mos viloyat yo‘q</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
