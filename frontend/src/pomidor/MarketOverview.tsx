import { useMemo } from "react";
import Fundamentals from "./Fundamentals";
import HeroChart from "./HeroChart";
import NewsPanel from "./NewsPanel";
import ProductBrief from "./ProductBrief";
import SparkCard from "./SparkCard";
import Watchlist from "./Watchlist";
import { formatPrice } from "./lib/format";
import type { ChartPoint, PlanId, Product } from "./types";

type MarketOverviewProps = {
  products: Product[];
  product: Product;
  live: boolean;
  onSelect: (id: string) => void;
  onAll: () => void;
  plan: PlanId;
  isSignedIn: boolean;
  getToken?: () => Promise<string | null>;
  onNeedAuth: () => void;
  onNeedPlan: () => void;
};

function basketSeries(products: Product[]): ChartPoint[] {
  const sameUnit = products.filter((item) => item.unit === "kg");
  const source = sameUnit.length ? sameUnit : products;
  const dates = source[0]?.chartData.map((point) => point.date) ?? [];
  return dates.map((date, index) => {
    const prices = source
      .map((item) => item.chartData[index]?.price ?? 0)
      .filter((price) => price > 0);
    const price = prices.length ? Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length) : 0;
    return { date, price, volume: 0 };
  });
}

export default function MarketOverview({ products, product, live: _live, onSelect, onAll, plan, isSignedIn, getToken, onNeedAuth, onNeedPlan }: MarketOverviewProps) {
  const basket = useMemo(() => basketSeries(products), [products]);
  const basketPrice = basket.filter((point) => point.price > 0).at(-1)?.price ?? 0;
  const basketPrev = basket.filter((point) => point.price > 0).at(-2)?.price ?? basketPrice;
  const basketChange = basketPrev ? Number((((basketPrice - basketPrev) / basketPrev) * 100).toFixed(1)) : 0;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Bozor ko'rinishi</h1>
        </div>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HeroChart
            product={product}
            plan={plan}
            getToken={getToken}
            isSignedIn={isSignedIn}
            onNeedAuth={onNeedAuth}
            onNeedPlan={onNeedPlan}
          />
        </div>
        <div className="lg:col-span-4">
          <Watchlist products={products} selectedId={product.id} onSelect={onSelect} onAll={onAll} />
        </div>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ProductBrief product={product} />
        </div>
        <div className="lg:col-span-4">
          <SparkCard
            title="Bozor savati"
            ticker="O'rtacha kg"
            price={`${formatPrice(basketPrice)} so'm / kg`}
            change={basketChange}
            data={basket}
          />
        </div>
      </div>

      <Fundamentals product={product} products={products} />

      <NewsPanel onOpenProduct={onSelect} />
    </div>
  );
}
