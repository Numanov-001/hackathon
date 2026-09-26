import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { formatPrice } from "./lib/format";
import { tickerOf } from "./lib/ticker";
import { cn } from "./lib/cn";
import type { Product } from "./types";

type ProductSearchProps = {
  products: Product[];
  onOpenProduct: (id: string) => void;
  className?: string;
};

export default function ProductSearch({ products, onOpenProduct, className }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const matches = products.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return item.name.toLowerCase().includes(q) || tickerOf(item.id).toLowerCase().includes(q);
  });

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

  return (
    <div className={cn("relative min-w-0 max-w-md flex-1", className)} ref={root}>
      <label className="sr-only" htmlFor={inputId}>Mahsulot qidiruvi</label>
      <Search size={16} strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        id={inputId}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Qidiruv"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-controls={listId}
        className="h-10 w-full rounded-full border border-line bg-subtle pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent focus:bg-surface"
      />
      {open && query.trim() && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[10px] border border-line bg-surface shadow-overlay"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">Bunday tovar yo‘q. Pomidor, truba yoki un deb yozing.</li>
          ) : (
            matches.map((item) => (
              <li key={item.id} role="option">
                <button
                  type="button"
                  className={cn("flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-subtle")}
                  onClick={() => {
                    onOpenProduct(item.id);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span>
                    <span className="font-medium text-ink">{item.name}</span>
                    <span className="ml-2 text-[13px] text-muted">{tickerOf(item.id)}</span>
                  </span>
                  <span className="tabular text-muted">{formatPrice(item.price)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
