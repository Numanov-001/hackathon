import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MOCK_SOURCE, yearlyVolume } from "./data/catalog";
import Fundamentals from "./Fundamentals";
import HeroChart from "./HeroChart";
import NewsPanel from "./NewsPanel";
import SparkCard from "./SparkCard";
import Watchlist from "./Watchlist";
import { formatPrice, signedPct } from "./lib/format";
import { priceUnit } from "./lib/unit";
import type { ChartPoint, Product } from "./types";

type MarketOverviewProps = {
  products: Product[];
  product: Product;
  live: boolean;
  onSelect: (id: string) => void;
  onAll: () => void;
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

export default function MarketOverview({ products, product, live: _live, onSelect, onAll }: MarketOverviewProps) {
  const basket = useMemo(() => basketSeries(products), [products]);
  const basketPrice = basket.filter((point) => point.price > 0).at(-1)?.price ?? 0;
  const basketPrev = basket.filter((point) => point.price > 0).at(-2)?.price ?? basketPrice;
  const basketChange = basketPrev ? Number((((basketPrice - basketPrev) / basketPrev) * 100).toFixed(1)) : 0;
  const topUp = products.reduce((best, item) => (item.change > best.change ? item : best), products[0]);
  const topDown = products.reduce((best, item) => (item.change < best.change ? item : best), products[0]);
  const volumeBars = [...products]
    .sort((a, b) => yearlyVolume(b) - yearlyVolume(a))
    .slice(0, 6)
    .map((row) => ({ name: row.name, volume: Math.round(yearlyVolume(row) / 1000) }));
  const topVolume = [...products].sort((a, b) => yearlyVolume(b) - yearlyVolume(a))[0];
  const growth = topUp?.change ?? 0;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Bozor ko‘rinishi</h1>
          <p className="text-[13px] text-muted">
            {MOCK_SOURCE.label}. {MOCK_SOURCE.note}
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HeroChart product={product} />
        </div>
        <div className="lg:col-span-4">
          <Watchlist products={products} selectedId={product.id} onSelect={onSelect} onAll={onAll} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SparkCard
          title="Bozor savati"
          ticker="SAVAT"
          price={`${formatPrice(basketPrice)} UZS/kg`}
          change={basketChange}
          data={basket}
        />
        <SparkCard
          title={topUp?.name ?? "O‘sish"}
          ticker="TOP+"
          price={`${formatPrice(topUp?.price ?? 0)} ${topUp ? priceUnit(topUp.unit) : "UZS"}`}
          change={topUp?.change ?? 0}
          data={topUp?.chartData ?? []}
          onClick={topUp ? () => onSelect(topUp.id) : undefined}
        />
        <SparkCard
          title={topDown?.name ?? "Pasayish"}
          ticker="TOP−"
          price={`${formatPrice(topDown?.price ?? 0)} ${topDown ? priceUnit(topDown.unit) : "UZS"}`}
          change={topDown?.change ?? 0}
          data={topDown?.chartData ?? []}
          onClick={topDown ? () => onSelect(topDown.id) : undefined}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <NewsPanel onOpenProduct={onSelect} />
        </div>
        <div className="grid gap-4 lg:col-span-5">
          <article className="rounded-[10px] border border-line bg-surface p-4">
            <h2 className="text-base font-semibold text-ink">12 oy hajm</h2>
            <p className="mb-3 text-[13px] text-muted">Hisobiy birlik, mingda. Taqqoslash uchun.</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeBars} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#4E5A54", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "#F4F6F5" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      return (
                        <div className="rounded-[6px] border border-line bg-surface px-2.5 py-1.5 shadow-overlay">
                          <p className="text-[13px] font-semibold text-ink">{payload[0].payload.name}</p>
                          <p className="tabular text-[13px] text-muted">{formatPrice(Number(payload[0].value))} ming</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="volume" fill="#146B43" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[13px] text-muted">
              Eng ko‘p o‘sish {signedPct(growth)}. Eng ko‘p hajm: {topVolume?.name ?? "—"}.
            </p>
          </article>
          <Fundamentals product={product} onOpenProduct={onSelect} />
        </div>
      </div>
    </div>
  );
}
