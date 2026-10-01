import { useMemo, useState } from "react";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { CATEGORY_LABEL } from "./data/catalog";
import ProductMark from "./ProductMark";
import { formatPrice, signedPct } from "./lib/format";
import { tickerOf } from "./lib/ticker";
import { priceUnit } from "./lib/unit";
import { cn } from "./lib/cn";
import type { Product, ProductCategory } from "./types";

type WatchlistProps = {
  products: Product[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAll: () => void;
  loading?: boolean;
};

const FILTERS: Array<{ id: "all" | ProductCategory; label: string }> = [
  { id: "all", label: "Barchasi" },
  { id: "sabzavot", label: CATEGORY_LABEL.sabzavot },
  { id: "meva", label: CATEGORY_LABEL.meva },
  { id: "don", label: CATEGORY_LABEL.don },
  { id: "truba", label: CATEGORY_LABEL.truba },
  { id: "optom", label: CATEGORY_LABEL.optom },
];

export default function Watchlist({ products, selectedId, onSelect, onAll, loading }: WatchlistProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const visible = useMemo(
    () => (filter === "all" ? products : products.filter((item) => item.category === filter)),
    [filter, products],
  );

  return (
    <section className="flex h-full max-h-[420px] min-h-0 flex-col rounded-[10px] border border-line bg-surface lg:max-h-none lg:min-h-[420px]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-base font-semibold text-ink">Asosiy tovarlar</h2>
        <button type="button" onClick={onAll} className="inline-flex min-h-8 items-center gap-0.5 text-[13px] font-semibold text-accent hover:underline">
          Barchasi
          <ChevronRight size={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-line px-3 py-2" role="tablist" aria-label="Turkums">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "min-h-8 rounded-[6px] px-2.5 text-[13px] font-semibold",
              filter === item.id ? "bg-soft text-accent" : "text-muted hover:bg-subtle hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ul className="max-h-[460px] flex-1 divide-y divide-line overflow-y-auto">
        {visible.map((product) => {
          const up = product.change >= 0;
          const selected = product.id === selectedId;
          return (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onSelect(product.id)}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-150",
                  selected ? "bg-soft" : "hover:bg-subtle",
                )}
              >
                <ProductMark name={product.name} image={product.image} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
                  <span className="block text-[13px] text-muted">
                    {tickerOf(product.id)} · {priceUnit(product.unit)}{product.month ? ` · ${product.month}` : ""}
                  </span>
                </span>
                <span className="text-right">
                  <span className="tabular block text-sm font-semibold text-ink">
                    {product.price > 0 ? formatPrice(product.price) : loading ? "…" : "—"}
                  </span>
                  {product.previousPrice ? (
                    <span className="tabular block text-[11px] text-muted">{formatPrice(product.previousPrice)}</span>
                  ) : null}
                </span>
                <span className={cn("tabular inline-flex min-w-[72px] items-center justify-end gap-0.5 text-[13px] font-semibold", product.price > 0 ? (up ? "text-ask" : "text-bid") : "text-muted")}>
                  {product.price > 0 ? (
                    <>
                      {up ? <TrendingUp size={12} strokeWidth={2} aria-hidden="true" /> : <TrendingDown size={12} strokeWidth={2} aria-hidden="true" />}
                      {signedPct(product.changePercent ?? product.change)}
                    </>
                  ) : "—"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
