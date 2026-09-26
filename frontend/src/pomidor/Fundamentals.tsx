import type { ReactNode } from "react";
import { Check, CircleHelp, Percent, Scale, Sprout, TrendingDown, TrendingUp } from "lucide-react";
import { analyzeProduct, plainRead } from "./data/analysis";
import { formatPrice, signedPct } from "./lib/format";
import { UNIT_LABEL } from "./lib/unit";
import { cn } from "./lib/cn";
import type { Product, ProductUnit } from "./types";

type FundamentalsProps = {
  product: Product;
  products: Product[];
};

function vsAvg(price: number, avg: number) {
  if (!avg) return 0;
  return Number((((price - avg) / avg) * 100).toFixed(1));
}

function somUnit(price: number, unit: ProductUnit) {
  return `${formatPrice(price)} so‘m / ${UNIT_LABEL[unit]}`;
}

function changeLine(before: number, now: number) {
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

function whyNow(
  stats: ReturnType<typeof analyzeProduct>,
  read: ReturnType<typeof plainRead>,
  unit: ProductUnit,
) {
  const items = [`Yil o‘rtachasi ${somUnit(stats.yearAvg, unit)}.`];
  if (read.band === "arzon") {
    items.push("Yil pastiga yaqin — olish yoki zaxira qilish qulay.");
  } else if (read.band === "qimmat") {
    items.push("Yil yuqorisiga yaqin — kutish mumkin.");
  } else {
    items.push("Na judayam arzon, na judayam qimmat.");
  }
  const monthGap = Math.round(stats.last - stats.prevMonth);
  if (Math.abs(monthGap) >= 1) {
    items.push(`O‘tgan oyga qaraganda ${changeLine(stats.prevMonth, stats.last)}.`);
  }
  items.push(`Bir yil oldin ${somUnit(stats.yearAgo, unit)}.`);
  if (stats.profile?.season) items.push(`${stats.profile.season}.`);
  return items.slice(0, 5);
}

function rangeTicks(low: number, high: number) {
  const span = Math.max(high - low, 1);
  return [0, 0.25, 0.5, 0.75, 1].map((part) => Math.round(low + span * part));
}

function Kpi({
  icon,
  label,
  value,
  unit,
  meta,
  metaTone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit: ProductUnit;
  meta: string;
  metaTone: string;
}) {
  return (
    <article className="min-w-0 rounded-[10px] bg-subtle px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-soft text-accent" aria-hidden="true">
          {icon}
        </span>
        <p className="text-[13px] text-muted">{label}</p>
      </div>
      <p className="tabular mt-3 text-xl font-semibold leading-[1.2] text-ink">
        {formatPrice(value)} <span className="text-[13px] font-medium text-muted">so‘m / {UNIT_LABEL[unit]}</span>
      </p>
      <p className={cn("mt-1 text-[13px] font-semibold", metaTone)}>{meta}</p>
    </article>
  );
}

export default function Fundamentals({ product, products }: FundamentalsProps) {
  const stats = analyzeProduct(product, products);
  const read = plainRead(stats);
  const profile = stats.profile;
  const marker = Math.min(100, Math.max(0, stats.position));
  const unit = product.unit;
  const vsYear = vsAvg(stats.last, stats.yearAvg);
  const vsLow = vsAvg(stats.low, stats.yearAvg);
  const vsHigh = vsAvg(stats.high, stats.yearAvg);
  const reasons = whyNow(stats, read, unit);
  const ticks = rangeTicks(stats.low, stats.high);
  const band = read.band;
  const pillEdge = marker < 16 ? "left" : marker > 84 ? "right" : "center";

  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5" aria-labelledby="price-read">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full",
              band === "qimmat" ? "bg-subtle text-bid" : band === "arzon" ? "bg-soft text-ask" : "bg-subtle text-ink",
            )}
            aria-hidden="true"
          >
            {band === "qimmat" ? <TrendingUp size={18} strokeWidth={1.8} /> : <Sprout size={18} strokeWidth={1.8} />}
          </span>
          <div>
            <h2
              id="price-read"
              className={cn("text-xl font-semibold leading-[1.2]", band === "qimmat" ? "text-bid" : band === "arzon" ? "text-ask" : "text-ink")}
            >
              {read.title}
            </h2>
            <p className="mt-1 max-w-md text-sm text-ink">{read.hint}</p>
          </div>
        </div>
        <p className="text-right">
          <span className="tabular block text-[32px] font-semibold leading-[1.2] text-ink">{formatPrice(stats.last)}</span>
          <span className="text-[13px] text-muted">so‘m / {UNIT_LABEL[unit]}</span>
          <span className={cn("mt-1 flex items-center justify-end gap-1 text-[13px] font-semibold", vsYear > 0 ? "text-bid" : vsYear < 0 ? "text-ask" : "text-ink")}>
            {vsYear > 0 ? <TrendingUp size={12} strokeWidth={2} aria-hidden="true" /> : vsYear < 0 ? <TrendingDown size={12} strokeWidth={2} aria-hidden="true" /> : null}
            {signedPct(vsYear)} · yil o‘rtachasi
          </span>
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi
          icon={<Sprout size={16} strokeWidth={1.8} />}
          label="Eng arzon past narx"
          value={stats.low}
          unit={unit}
          meta={`${signedPct(vsLow)} · ${stats.cheapLabel}`}
          metaTone={vsLow > 0 ? "text-bid" : "text-ask"}
        />
        <Kpi
          icon={<Scale size={16} strokeWidth={1.8} />}
          label="Hozirgi narx"
          value={stats.last}
          unit={unit}
          meta={`${signedPct(vsYear)} · yil o‘rtachasi`}
          metaTone={vsYear > 0 ? "text-bid" : vsYear < 0 ? "text-ask" : "text-ink"}
        />
        <Kpi
          icon={<TrendingUp size={16} strokeWidth={1.8} />}
          label="Eng qimmat narx"
          value={stats.high}
          unit={unit}
          meta={`${signedPct(vsHigh)} · ${stats.dearLabel}`}
          metaTone="text-bid"
        />
        <Kpi
          icon={<Percent size={16} strokeWidth={1.8} />}
          label="O‘tgan oy"
          value={stats.prevMonth}
          unit={unit}
          meta={changeLine(stats.prevMonth, stats.last)}
          metaTone={changeTone(stats.prevMonth, stats.last)}
        />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h3 className="text-sm font-semibold text-ink">Narxlar diapazoni</h3>
          <p className="mt-1 text-[13px] text-muted">12 oylik past va yuqori. Nuqta — hozirgi narx.</p>

          <div className="relative mt-4 pt-12">
            <div
              className={cn(
                "absolute top-0 rounded-[6px] bg-soft px-3 py-2 text-center",
                pillEdge === "left" && "left-0",
                pillEdge === "right" && "right-0",
                pillEdge === "center" && "-translate-x-1/2",
              )}
              style={pillEdge === "center" ? { left: `${marker}%` } : undefined}
            >
              <p className="tabular text-[13px] font-semibold text-ink">{somUnit(stats.last, unit)}</p>
              <p className="text-[13px] text-muted">Hozirgi narx</p>
            </div>

            <div
              className="relative h-2 rounded-full"
              role="img"
              aria-label={`${product.name}: ${read.title}. Hozir ${somUnit(stats.last, unit)}. Eng arzon ${somUnit(stats.low, unit)}, ${stats.cheapLabel}. Eng qimmat ${somUnit(stats.high, unit)}, ${stats.dearLabel}.`}
              style={{ background: "linear-gradient(to right, var(--color-ask), var(--color-live), var(--color-bid))" }}
            >
              {[0, 25, 50, 75, 100].map((stop) => (
                <span
                  key={stop}
                  className={cn(
                    "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface",
                    stop <= 25 ? "bg-ask" : stop === 50 ? "bg-live" : "bg-bid",
                    Math.abs(stop - marker) < 8 && "opacity-0",
                  )}
                  style={{ left: `${stop}%` }}
                />
              ))}
              <span
                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink"
                style={{ left: `${marker}%` }}
              />
            </div>

            <div className="mt-3 flex justify-between gap-2 text-[13px] text-muted">
              {ticks.map((price, index) => (
                <span key={price} className={cn("tabular", index > 0 && index < ticks.length - 1 && "hidden sm:inline")}>
                  {formatPrice(price)}
                </span>
              ))}
            </div>
            <div className="mt-1 flex justify-between gap-4 text-[13px]">
              <p>
                <span className="font-semibold text-ask">Eng arzon</span>
                <span className="block text-muted">{stats.cheapLabel}</span>
              </p>
              <p className="text-right">
                <span className="font-semibold text-bid">Eng qimmat</span>
                <span className="block text-muted">{stats.dearLabel}</span>
              </p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4" aria-labelledby="why-now">
          <h3 id="why-now" className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CircleHelp size={16} strokeWidth={1.8} aria-hidden="true" />
            Nima uchun hozir?
          </h3>
          <ul className="mt-3 grid gap-2">
            {reasons.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink">
                <Check size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ask" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-3 border-t border-line pt-4 text-[13px] text-muted">
        <p>
          Eng arzon: <span className="tabular font-semibold text-ink">{somUnit(stats.low, unit)}</span> ({stats.cheapLabel})
          <span className="mx-2">·</span>
          Hozir: <span className="tabular font-semibold text-ink">{somUnit(stats.last, unit)}</span>
          <span className="mx-2">·</span>
          Eng qimmat: <span className="tabular font-semibold text-ink">{somUnit(stats.high, unit)}</span> ({stats.dearLabel})
        </p>
        {profile && (
          <p className="max-w-md text-ink">
            {profile.hubs}. {profile.season}.
          </p>
        )}
      </div>
    </section>
  );
}
