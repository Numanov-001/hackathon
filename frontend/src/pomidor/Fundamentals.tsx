import { analyzeProduct, plainRead } from "./data/analysis";
import { formatPrice } from "./lib/format";
import { UNIT_LABEL } from "./lib/unit";
import { cn } from "./lib/cn";
import type { Product, ProductUnit } from "./types";

type FundamentalsProps = {
  product: Product;
  products: Product[];
};

function somChange(before: number, now: number) {
  const gap = Math.round(now - before);
  if (Math.abs(gap) < 1) return "deyarli bir xil";
  const amount = formatPrice(Math.abs(gap));
  return gap > 0 ? `${amount} so‘m qimmatroq` : `${amount} so‘m arzonroq`;
}

function changeTone(before: number, now: number) {
  const gap = now - before;
  if (Math.abs(gap) < 1) return "text-ink";
  return gap > 0 ? "text-bid" : "text-ask";
}

function Row({
  label,
  before,
  now,
  unit,
}: {
  label: string;
  before: number;
  now: number;
  unit: ProductUnit;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right">
        <span className="tabular text-sm font-semibold text-ink">{formatPrice(before)} so‘m / {UNIT_LABEL[unit]}</span>
        <span className={cn("mt-0.5 block text-[13px] font-semibold", changeTone(before, now))}>{somChange(before, now)}</span>
      </dd>
    </div>
  );
}

export default function Fundamentals({ product, products }: FundamentalsProps) {
  const stats = analyzeProduct(product, products);
  const read = plainRead(stats);
  const profile = stats.profile;
  const marker = Math.min(100, Math.max(0, stats.position));
  const unit = product.unit;

  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5" aria-labelledby="price-read">
      <div className="flex items-end justify-between gap-4 rounded-[10px] bg-subtle px-4 py-4">
        <div>
          <h2
            id="price-read"
            className={cn("text-xl font-semibold leading-[1.2]", read.band === "qimmat" ? "text-bid" : read.band === "arzon" ? "text-ask" : "text-ink")}
          >
            {read.title}
          </h2>
          <p className="mt-1 max-w-md text-sm text-ink">{read.hint}</p>
        </div>
        <p className="text-right">
          <span className="tabular block text-[32px] font-semibold leading-[1.2] text-ink">{formatPrice(stats.last)}</span>
          <span className="text-[13px] text-muted">so‘m / {UNIT_LABEL[unit]}</span>
        </p>
      </div>

      <div className="mt-5">
        <div
          className="relative h-2 rounded-full bg-subtle"
          role="img"
          aria-label={`${product.name}: ${read.title}. Hozir ${formatPrice(stats.last)} so‘m. Eng arzon ${formatPrice(stats.low)} so‘m, ${stats.cheapLabel}. Eng qimmat ${formatPrice(stats.high)} so‘m, ${stats.dearLabel}.`}
        >
          <span className="absolute inset-y-0 left-0 w-1/3 rounded-l-full bg-soft" />
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink"
            style={{ left: `${marker}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between gap-4 text-[13px]">
          <p>
            <span className="block text-muted">Eng arzon</span>
            <span className="tabular font-semibold text-ink">{formatPrice(stats.low)}</span>
            <span className="block text-muted">{stats.cheapLabel}</span>
          </p>
          <p className="text-right">
            <span className="block text-muted">Eng qimmat</span>
            <span className="tabular font-semibold text-ink">{formatPrice(stats.high)}</span>
            <span className="block text-muted">{stats.dearLabel}</span>
          </p>
        </div>
      </div>

      <dl className="mt-2 divide-y divide-line border-t border-line">
        <Row label="O‘tgan oy" before={stats.prevMonth} now={stats.last} unit={unit} />
        <Row label="Odatdagi narx" before={stats.yearAvg} now={stats.last} unit={unit} />
        <Row label="Bir yil oldin" before={stats.yearAgo} now={stats.last} unit={unit} />
      </dl>

      {profile && (
        <p className="mt-4 text-sm text-ink">
          {profile.hubs}. {profile.season}.
        </p>
      )}
      {profile?.note && <p className="mt-1 text-sm text-muted">{profile.note}</p>}
    </section>
  );
}
