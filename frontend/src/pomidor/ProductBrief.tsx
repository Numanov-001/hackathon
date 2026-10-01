import { chartBlurb, monthMove, unitPhrase } from "./data/briefs";
import { formatPrice, signedPct } from "./lib/format";
import { cn } from "./lib/cn";
import type { Product } from "./types";

export default function ProductBrief({ product }: { product: Product }) {
  const up = product.change >= 0;

  return (
    <article className="flex h-full flex-col gap-4 rounded-[10px] border border-line bg-surface p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
      <img
        src={product.image}
        alt={product.name}
        className="h-24 w-24 shrink-0 rounded-[10px] object-cover ring-1 ring-line"
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold text-ink">{product.name}</h2>
        <p className="mt-1 tabular text-xl font-semibold leading-tight text-ink">
          {unitPhrase(product.unit)} — {formatPrice(product.price)} so‘m
        </p>
        <p className={cn("mt-1 text-sm font-semibold", up ? "text-ask" : "text-bid")}>
          {signedPct(product.changePercent ?? product.change)} · {monthMove(product)}
          {product.previousPrice ? ` · oldingi ${formatPrice(product.previousPrice)}` : ""}
          {product.month ? ` · ${product.month}` : ""}
        </p>
        <p className="mt-3 text-sm leading-normal text-muted">{chartBlurb(product)}</p>
      </div>
    </article>
  );
}
