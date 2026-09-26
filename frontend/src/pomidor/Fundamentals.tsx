import { yearlyVolume } from "./data/catalog";
import { formatPrice, signedPct } from "./lib/format";
import { priceUnit } from "./lib/unit";
import type { Product } from "./types";

type FundamentalsProps = {
  product: Product;
  onOpenProduct: (id: string) => void;
};

const TONES = ["#146B43", "#8A4B08", "#1E4D7B", "#6B3A4A"];

export default function Fundamentals({ product, onOpenProduct }: FundamentalsProps) {
  const year = product.chartData.slice(-12);
  const prev = product.chartData.slice(-24, -12);
  const yearAvg = year.length
    ? Math.round(year.reduce((sum, point) => sum + point.price, 0) / year.length)
    : product.price;
  const prevAvg = prev.length
    ? Math.round(prev.reduce((sum, point) => sum + point.price, 0) / prev.length)
    : yearAvg;
  const yoy = prevAvg ? Number((((yearAvg - prevAvg) / prevAvg) * 100).toFixed(1)) : 0;
  const prices = year.map((point) => point.price);
  const high = prices.length ? Math.max(...prices) : product.price;
  const low = prices.length ? Math.min(...prices) : product.price;
  const vol = yearlyVolume(product);

  return (
    <section className="grid gap-4">
      <article className="rounded-[10px] border border-line bg-surface p-4">
        <h2 className="text-base font-semibold text-ink">12 oy diapazon</h2>
        <p className="mb-3 text-[13px] text-muted">{product.name} · past / yuqori.</p>
        <div className="flex h-3 overflow-hidden rounded-full bg-subtle" role="img" aria-label={`${product.name} 12 oylik diapazon`}>
          {TONES.map((tone, index) => (
            <span key={tone} className="h-full" style={{ width: `${[34, 28, 20, 18][index]}%`, background: tone }} />
          ))}
        </div>
        <ul className="mt-3 grid gap-1.5 text-[13px]">
          <li className="flex justify-between">
            <span className="text-muted">Past</span>
            <span className="tabular font-semibold text-ink">{formatPrice(low)} {priceUnit(product.unit)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted">Yuqori</span>
            <span className="tabular font-semibold text-ink">{formatPrice(high)} {priceUnit(product.unit)}</span>
          </li>
        </ul>
      </article>

      <article className="rounded-[10px] border border-line bg-surface p-4">
        <h2 className="text-base font-semibold text-ink">Fundamental</h2>
        <p className="mb-3 text-[13px] text-muted">{product.name} bo‘yicha qisqa kontekst.</p>
        <dl className="grid gap-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted">Oxirgi o‘rtacha</dt>
            <dd className="tabular font-semibold text-ink">{formatPrice(product.price)} {priceUnit(product.unit)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted">Oylik o‘zgarish</dt>
            <dd className={`tabular font-semibold ${product.change >= 0 ? "text-ask" : "text-bid"}`}>{signedPct(product.change)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted">12 oy o‘rtacha</dt>
            <dd className="tabular font-semibold text-ink">{formatPrice(yearAvg)} {priceUnit(product.unit)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted">Yillik farq</dt>
            <dd className={`tabular font-semibold ${yoy >= 0 ? "text-ask" : "text-bid"}`}>{signedPct(yoy)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted">12 oy hajm</dt>
            <dd className="tabular font-semibold text-ink">{formatPrice(vol)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[13px] text-muted">
          Mock qator. P2P e’lonlari niyat, yopilgan savdo emas.{" "}
          <button type="button" className="font-semibold text-accent hover:underline" onClick={() => onOpenProduct(product.id)}>
            Grafikka qaytish
          </button>
        </p>
      </article>
    </section>
  );
}
