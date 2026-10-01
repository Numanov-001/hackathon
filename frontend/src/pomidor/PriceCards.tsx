import { TrendingDown, TrendingUp } from "lucide-react";
import { SIAT_CROP_IDS } from "./data/siat1308";
import { formatPrice, signedPct } from "./lib/format";
import { cn } from "./lib/cn";
import type { Product } from "./types";

type PriceCardsProps = {
  products: Product[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
};

const EMOJI: Record<string, string> = {
  pomidor: "🍅",
  kartoshka: "🥔",
  piyoz: "🧅",
  sabzi: "🥕",
};

export default function PriceCards({ products, selectedId, onSelect, loading }: PriceCardsProps) {
  const cards = SIAT_CROP_IDS.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[];

  return (
    <section aria-labelledby="prices-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 id="prices-title" className="text-xl font-semibold text-ink">Bozor narxlari</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">Rasmiy ma'lumotlar asosida O'zbekiston oziq-ovqat bozorini kuzating.</p>
          <p className="mt-3 text-sm font-medium text-ink">Bozorni kuzating. Narxni tahlil qiling. To'g'ri vaqtda savdo qiling.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((product) => {
          const up = (product.changePercent ?? product.change) >= 0;
          const selected = product.id === selectedId;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product.id)}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "rounded-[10px] border bg-surface p-4 text-left transition-colors",
                selected ? "border-accent bg-soft" : "border-line hover:bg-subtle",
              )}
            >
              <p className="text-sm font-medium text-ink">
                <span aria-hidden="true">{EMOJI[product.id] ?? ""} </span>
                {product.name}
              </p>
              <p className="mt-2 tabular text-2xl font-semibold text-ink">
                {product.price > 0 ? formatPrice(product.price) : loading ? "…" : "—"}
                <span className="ml-1 text-sm font-medium text-muted">so‘m/kg</span>
              </p>
              <p className={cn("mt-2 inline-flex items-center gap-1 text-sm font-semibold", product.price > 0 ? (up ? "text-ask" : "text-bid") : "text-muted")}>
                {product.price > 0 ? (
                  <>
                    {up ? <TrendingUp size={14} strokeWidth={1.8} /> : <TrendingDown size={14} strokeWidth={1.8} />}
                    {signedPct(product.changePercent ?? product.change)}
                  </>
                ) : "—"}
              </p>
              {product.previousPrice ? (
                <p className="mt-1 text-[13px] text-muted">Oldingi oy: {formatPrice(product.previousPrice)} so'm/kg</p>
              ) : null}
              <p className="mt-1 text-[13px] text-muted">Oxirgi yangilanish: {product.month || "—"}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
