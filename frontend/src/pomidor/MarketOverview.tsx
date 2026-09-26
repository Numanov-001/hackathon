import Fundamentals from "./Fundamentals";
import HeroChart from "./HeroChart";
import NewsPanel from "./NewsPanel";
import ProductBrief from "./ProductBrief";
import Watchlist from "./Watchlist";
import type { PlanId, Product } from "./types";

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

export default function MarketOverview({ products, product, live: _live, onSelect, onAll, plan, isSignedIn, getToken, onNeedAuth, onNeedPlan }: MarketOverviewProps) {
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

      <ProductBrief product={product} />

      <Fundamentals product={product} products={products} />

      <NewsPanel onOpenProduct={onSelect} />
    </div>
  );
}
