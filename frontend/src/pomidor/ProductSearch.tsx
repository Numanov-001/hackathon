import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { formatPrice } from "./lib/format";
import { tickerOf } from "./lib/ticker";
import { cn } from "./lib/cn";
import type { P2POffer } from "./data/p2p";
import type { Product } from "./types";

type ProductSearchProps = {
  products: Product[];
  offers?: P2POffer[];
  onOpenProduct: (id: string) => void;
  onOpenP2P?: () => void;
  className?: string;
};

export default function ProductSearch({ products, offers = [], onOpenProduct, onOpenP2P, className }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const q = query.trim().toLowerCase();

  const mahsulotlar = q
    ? products.filter((item) => item.name.toLowerCase().includes(q) || tickerOf(item.id).toLowerCase().includes(q)).slice(0, 6)
    : [];
  const bozor = mahsulotlar.filter((item) => item.price > 0).slice(0, 4);
  const p2p = q
    ? offers.filter((item) => item.productName.toLowerCase().includes(q) || item.region.toLowerCase().includes(q) || item.seller.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const hasAny = mahsulotlar.length + p2p.length > 0;

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

  function close() {
    setQuery("");
    setOpen(false);
  }

  return (
    <div className={cn("relative min-w-0 max-w-md flex-1", className)} ref={root}>
      <label className="sr-only" htmlFor={inputId}>Qidiruv</label>
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
        aria-expanded={open && Boolean(q)}
        aria-controls={listId}
        className="h-10 w-full rounded-full border border-line bg-subtle pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent focus:bg-surface"
      />
      {open && q && (
        <div id={listId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-[10px] border border-line bg-surface shadow-overlay">
          {!hasAny && <p className="px-3 py-3 text-sm text-muted">Mos natija yo‘q.</p>}
          {mahsulotlar.length > 0 && (
            <section>
              <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Mahsulotlar</p>
              <ul>
                {mahsulotlar.map((item) => (
                  <li key={`p-${item.id}`} role="option">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-subtle"
                      onClick={() => { onOpenProduct(item.id); close(); }}
                    >
                      <span>
                        <span className="font-medium text-ink">{item.name}</span>
                        <span className="ml-2 text-[13px] text-muted">{tickerOf(item.id)}</span>
                      </span>
                      <span className="tabular text-muted">{item.price > 0 ? formatPrice(item.price) : "—"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {p2p.length > 0 && (
            <section>
              <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">P2P</p>
              <ul>
                {p2p.map((item) => (
                  <li key={`o-${item.id}`} role="option">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-subtle"
                      onClick={() => { onOpenP2P?.(); close(); }}
                    >
                      <span className="font-medium text-ink">{item.productName} · {item.region}</span>
                      <span className="tabular text-muted">{formatPrice(item.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {bozor.length > 0 && (
            <section>
              <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Bozor</p>
              <ul>
                {bozor.map((item) => (
                  <li key={`b-${item.id}`} role="option">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-subtle"
                      onClick={() => { onOpenProduct(item.id); close(); }}
                    >
                      <span className="font-medium text-ink">{item.name}</span>
                      <span className="tabular text-muted">{formatPrice(item.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Transport</p>
            <p className="px-3 pb-3 text-sm text-muted">Hozircha transport e’lonlari yo‘q.</p>
          </section>
        </div>
      )}
    </div>
  );
}
