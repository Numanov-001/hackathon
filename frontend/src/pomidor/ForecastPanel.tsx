import { useState } from "react";
import { Lock } from "lucide-react";
import { postJson } from "../api/client";
import { formatPrice } from "./lib/format";
import type { ForecastHorizon, PredictionData, Product } from "./types";

type ForecastPanelProps = {
  product: Product;
  premium: boolean;
  isSignedIn: boolean;
  getToken?: () => Promise<string | null>;
  onNeedAuth: () => void;
  onLock: () => void;
};

const HORIZONS: { id: ForecastHorizon; label: string }[] = [
  { id: 1, label: "Keyingi oy" },
  { id: 3, label: "3 oy" },
  { id: 6, label: "6 oy" },
  { id: 12, label: "12 oy" },
];

export default function ForecastPanel({ product, premium, isSignedIn, getToken, onNeedAuth, onLock }: ForecastPanelProps) {
  const [horizon, setHorizon] = useState<ForecastHorizon>(3);
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(next: ForecastHorizon) {
    if (!isSignedIn) {
      onNeedAuth();
      return;
    }
    if (!premium) {
      onLock();
      return;
    }
    setHorizon(next);
    setLoading(true);
    setError("");
    try {
      const token = getToken ? await getToken() : null;
      const result = (await postJson("/api/market-prices/forecast", { product: product.id, horizon: next }, token)) as PredictionData;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prognoz yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }

  const last = data?.predicted_points?.at(-1);

  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink">AI Bozor Prognozi</h2>
          <p className="text-[13px] text-muted">Prognoz — tarixiy ma'lumotlar asosida hisoblangan taxmin.</p>
        </div>
        <span className="rounded-full bg-soft px-3 py-1 text-[12px] font-semibold text-accent">Premium</span>
      </div>
      <p className="text-sm text-muted">{product.name} joriy: {formatPrice(product.price)} so'm/kg. Bu rasmiy statistika emas.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {HORIZONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => run(item.id)}
            className={`inline-flex min-h-10 items-center gap-1 rounded-[6px] px-3 text-[13px] font-semibold ${horizon === item.id && data ? "bg-accent text-on-accent" : "bg-subtle text-ink"}`}
          >
            {!premium && <Lock size={12} strokeWidth={1.8} aria-hidden="true" />}
            {item.label}
          </button>
        ))}
      </div>
      {loading && <p className="mt-3 text-sm text-muted" role="status">Prognoz hisoblanmoqda…</p>}
      {error && <p className="mt-3 text-sm text-bid" role="alert">{error}</p>}
      {last && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[10px] bg-subtle px-4 py-3">
            <p className="text-[13px] text-muted">Taxminiy narx</p>
            <p className="tabular text-xl font-semibold text-ink">{formatPrice(last.price)} so'm</p>
          </div>
          <div className="rounded-[10px] bg-subtle px-4 py-3">
            <p className="text-[13px] text-muted">Taxminiy oraliq</p>
            <p className="tabular text-xl font-semibold text-ink">{formatPrice(last.low)} – {formatPrice(last.high)} so'm</p>
          </div>
        </div>
      )}
    </section>
  );
}
