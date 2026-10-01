import { formatPrice, signedPct } from "./lib/format";
import type { Product } from "./types";

export type AnalyticsPayload = {
  current_price: number;
  previous_price: number | null;
  monthly_change: number | null;
  year_ago_price: number | null;
  yearly_change: number | null;
  min_price: number;
  max_price: number;
  average_price: number;
  highest_growth_month: string | null;
  lowest_price_month: string;
  current_month: string;
  unit: string;
};

type MarketAnalyticsProps = {
  product: Product;
  data: AnalyticsPayload | null;
  loading?: boolean;
  error?: string;
  premium?: boolean;
  onLock?: () => void;
};

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-surface px-4 py-3">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 tabular text-base font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}

export default function MarketAnalytics({ product, data, loading, error, premium, onLock }: MarketAnalyticsProps) {
  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink">Bozor tahlili</h2>
          <p className="text-[13px] text-muted">{product.name} · Tarixiy ma'lumotlar · Rasmiy manba SIAT 1308</p>
        </div>
        {!premium && (
          <button type="button" onClick={onLock} className="rounded-full bg-soft px-3 py-1 text-[12px] font-semibold text-accent">
            Premium
          </button>
        )}
      </div>
      {loading && <p className="text-sm text-muted" role="status">Tahlil yuklanmoqda…</p>}
      {error && <p className="text-sm text-bid" role="alert">{error}</p>}
      {data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Row label="O'rtacha narx" value={premium ? `${formatPrice(data.average_price)} so'm/kg` : "Premium"} />
          <Row label="Eng yuqori narx" value={premium ? `${formatPrice(data.max_price)} so'm/kg` : "Premium"} hint={premium ? data.highest_growth_month || undefined : undefined} />
          <Row label="Eng past narx" value={premium ? `${formatPrice(data.min_price)} so'm/kg` : "Premium"} hint={data.lowest_price_month} />
          <Row label="Oy davomida o'zgarish" value={data.monthly_change == null ? "Ma'lumot mavjud emas" : signedPct(data.monthly_change)} />
          <Row label="Yillik o'zgarish" value={data.yearly_change == null ? "Ma'lumot mavjud emas" : signedPct(data.yearly_change)} />
          <Row label="Narx trendi" value={data.monthly_change == null ? "—" : data.monthly_change > 1 ? "O'sish" : data.monthly_change < -1 ? "Pasayish" : "Barqaror"} />
        </div>
      )}
    </section>
  );
}
