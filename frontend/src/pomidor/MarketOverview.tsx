import { useEffect, useMemo, useState } from "react";
import Fundamentals from "./Fundamentals";
import ForecastPanel from "./ForecastPanel";
import HeroChart from "./HeroChart";
import LogisticsPanel from "./LogisticsPanel";
import MarketAnalytics, { type AnalyticsPayload } from "./MarketAnalytics";
import NewsPanel from "./NewsPanel";
import OpportunityStrip from "./OpportunityStrip";
import PriceAlerts from "./PriceAlerts";
import PriceCards from "./PriceCards";
import ProductBrief from "./ProductBrief";
import ProfitCalculator from "./ProfitCalculator";
import SmartMatch from "./SmartMatch";
import Watchlist from "./Watchlist";
import { getJson } from "../api/client";
import { SIAT_CROP_IDS } from "./data/siat1308";
import type { P2POffer } from "./data/p2p";
import { matchOffers, regionalSpreads } from "./lib/match";
import { formatLot, priceUnit } from "./lib/unit";
import { formatPrice } from "./lib/format";
import type { PlanId, Product } from "./types";

type MarketOverviewProps = {
  products: Product[];
  product: Product;
  live: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onSelect: (id: string) => void;
  onAll: () => void;
  plan: PlanId;
  premium: boolean;
  isSignedIn: boolean;
  getToken?: () => Promise<string | null>;
  onNeedAuth: () => void;
  onNeedPlan: () => void;
  message2020: string;
  offers: P2POffer[];
  contacts: boolean;
  onOpenP2P: () => void;
};

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;

export default function MarketOverview({
  products,
  product,
  live: _live,
  loading,
  error,
  onRetry,
  onSelect,
  onAll,
  plan,
  premium,
  isSignedIn,
  getToken,
  onNeedAuth,
  onNeedPlan,
  message2020,
  offers,
  contacts,
  onOpenP2P,
}: MarketOverviewProps) {
  const [year, setYear] = useState<number | "all">("all");
  const matches = useMemo(() => matchOffers(offers), [offers]);
  const spreads = useMemo(() => regionalSpreads(offers), [offers]);
  const crops = products.filter((item) => SIAT_CROP_IDS.includes(item.id as (typeof SIAT_CROP_IDS)[number]));
  const sellPreview = offers.find((item) => item.side === "sell");
  const buyPreview = offers.find((item) => item.side === "buy");
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    setAnalyticsLoading(true);
    setAnalyticsError("");
    getJson(`/api/market-prices/analytics?product=${encodeURIComponent(product.id)}`)
      .then((row) => {
        if (!cancel) setAnalytics(row as AnalyticsPayload);
      })
      .catch((err) => {
        if (!cancel) setAnalyticsError(err instanceof Error ? err.message : "Tahlil yo‘q.");
      })
      .finally(() => {
        if (!cancel) setAnalyticsLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [product.id]);

  return (
    <div className="grid gap-4">
      {loading && (
        <p className="rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-muted" role="status" aria-live="polite">
          Ma'lumotlarni yangilash…
        </p>
      )}
      {error && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-line bg-surface px-4 py-3" role="alert">
          <p className="text-sm text-bid">{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="min-h-10 rounded-[6px] bg-accent px-3 text-[13px] font-semibold text-on-accent">
              Qayta urinish
            </button>
          )}
        </div>
      )}

      <PriceCards products={products} selectedId={product.id} onSelect={onSelect} loading={loading} />

      <section className="grid items-stretch gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-ink">Narxlar dinamikasi</h2>
              <p className="text-[13px] text-muted">Tarixiy ma'lumotlar · UZS/kg</p>
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Yil">
              <button
                type="button"
                onClick={() => setYear("all")}
                className={`min-h-9 rounded-[6px] px-2.5 text-[13px] font-semibold ${year === "all" ? "bg-soft text-accent" : "text-muted hover:bg-subtle"}`}
              >
                Barchasi
              </button>
              {YEARS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setYear(item)}
                  className={`min-h-9 rounded-[6px] px-2.5 text-[13px] font-semibold ${year === item ? "bg-soft text-accent" : "text-muted hover:bg-subtle"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label="Mahsulot">
            {crops.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`min-h-9 rounded-[6px] px-2.5 text-[13px] font-semibold ${product.id === item.id ? "bg-soft text-accent" : "text-muted hover:bg-subtle"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {year === 2020 ? (
            <p className="rounded-[10px] border border-line bg-surface px-4 py-8 text-sm text-muted" role="status">
              {message2020}
            </p>
          ) : (
            <HeroChart
              product={product}
              plan={plan}
              getToken={getToken}
              isSignedIn={isSignedIn}
              onNeedAuth={onNeedAuth}
              onNeedPlan={onNeedPlan}
              year={year === "all" ? undefined : year}
            />
          )}
        </div>
        <div className="lg:col-span-4">
          <Watchlist products={products} selectedId={product.id} onSelect={onSelect} onAll={onAll} loading={loading} />
        </div>
      </section>

      <MarketAnalytics
        product={product}
        data={analytics}
        loading={analyticsLoading}
        error={analyticsError}
        premium={premium}
        onLock={onNeedPlan}
      />

      <ForecastPanel
        product={product}
        premium={premium}
        isSignedIn={isSignedIn}
        getToken={getToken}
        onNeedAuth={onNeedAuth}
        onLock={onNeedPlan}
      />

      <OpportunityStrip rows={spreads} premium={premium} onLock={onNeedPlan} onOpen={onSelect} />

      <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
        <h2 className="text-xl font-semibold text-ink">P2P marketplace</h2>
        <p className="mt-1 text-[13px] text-muted">Sotaman va sotib olaman — haqiqiy e’lonlar.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-[10px] border border-line p-4">
            <p className="text-sm font-semibold text-ink">Sotaman</p>
            {sellPreview ? (
              <>
                <p className="mt-2 font-medium">{sellPreview.productName}</p>
                <p className="text-sm text-muted">{formatLot(sellPreview.available, sellPreview.unit).primary} · {formatPrice(sellPreview.price)} {priceUnit(sellPreview.unit)}</p>
                <p className="text-sm text-muted">{sellPreview.region}</p>
              </>
            ) : <p className="mt-2 text-sm text-muted">Sotuv e’loni yo‘q.</p>}
            <button type="button" onClick={onOpenP2P} className="mt-3 min-h-10 rounded-[6px] bg-accent px-3 text-[13px] font-semibold text-on-accent">Taklifni ko'rish</button>
          </div>
          <div className="rounded-[10px] border border-line p-4">
            <p className="text-sm font-semibold text-ink">Sotib olaman</p>
            {buyPreview ? (
              <>
                <p className="mt-2 font-medium">{buyPreview.productName}</p>
                <p className="text-sm text-muted">{formatLot(buyPreview.available, buyPreview.unit).primary} · max {formatPrice(buyPreview.price)}</p>
                <p className="text-sm text-muted">{buyPreview.region}</p>
              </>
            ) : <p className="mt-2 text-sm text-muted">Xarid so‘rovi yo‘q.</p>}
            <button type="button" onClick={onOpenP2P} className="mt-3 min-h-10 rounded-[6px] border border-line px-3 text-[13px] font-semibold">Talabni ko'rish</button>
          </div>
        </div>
      </section>

      <SmartMatch rows={matches} contacts={contacts} onUnlock={onNeedPlan} onOpenP2P={onOpenP2P} />
      <LogisticsPanel onOpenP2P={onOpenP2P} />
      <ProfitCalculator products={products} premium={premium} onLock={onNeedPlan} />
      <PriceAlerts products={products} premium={premium} onLock={onNeedPlan} />

      <ProductBrief product={product} />
      <Fundamentals product={product} products={products} />
      <NewsPanel onOpenProduct={onSelect} />
    </div>
  );
}
