import { useId, useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MOCK_SOURCE } from "./data/catalog";
import ProductMark from "./ProductMark";
import { formatPrice, signedPct } from "./lib/format";
import { tickerOf } from "./lib/ticker";
import { priceUnit } from "./lib/unit";
import { cn } from "./lib/cn";
import type { Product } from "./types";

const MONTHS_UZ = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const RANGES = [
  { id: "3M", months: 3 },
  { id: "6M", months: 6 },
  { id: "1Y", months: 12 },
  { id: "2Y", months: 24 },
] as const;

function monthTick(value: string) {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return `${MONTHS_UZ[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

function monthLabel(value: string) {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return date.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" });
}

export default function HeroChart({ product }: { product: Product }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("1Y");
  const fillId = useId().replace(/:/g, "");
  const up = product.change >= 0;
  const color = up ? "#0E6B3C" : "#9B1C1C";
  const data = useMemo(() => {
    const live = product.chartData.filter((point) => point.price > 0);
    const months = RANGES.find((item) => item.id === range)?.months ?? 12;
    return live.slice(-months);
  }, [product.chartData, range]);

  return (
    <section className="flex h-full min-h-[420px] flex-col rounded-[10px] border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProductMark name={product.name} image={product.image} size="md" />
          <div>
            <h2 className="text-base font-semibold text-ink">{product.name}</h2>
            <p className="text-[13px] text-muted">{tickerOf(product.id)} · {priceUnit(product.unit)}</p>
          </div>
        </div>
        <div className="flex rounded-[6px] bg-subtle p-1" role="group" aria-label="Vaqt oralig‘i">
          {RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRange(item.id)}
              aria-pressed={range === item.id}
              className={cn(
                "min-h-8 rounded-[6px] px-3 text-[13px] font-semibold",
                range === item.id ? "bg-surface text-ink ring-1 ring-line" : "text-muted hover:text-ink",
              )}
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="tabular text-[32px] font-semibold leading-none tracking-tight text-ink">
          {formatPrice(product.price)}
          <span className="ml-2 text-base font-medium text-muted">{priceUnit(product.unit)}</span>
        </p>
        <p className={cn("mt-2 inline-flex items-center gap-1 text-sm font-semibold", up ? "text-ask" : "text-bid")}>
          {up ? <TrendingUp size={16} strokeWidth={1.8} aria-hidden="true" /> : <TrendingDown size={16} strokeWidth={1.8} aria-hidden="true" />}
          <span>{signedPct(product.change)}</span>
          <span className="font-medium text-muted">oxirgi oyga nisbatan</span>
        </p>
      </div>

      <div className="h-[280px] w-full lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.16} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E0E3EB" vertical={false} />
            <XAxis dataKey="date" tickFormatter={monthTick} tick={{ fill: "#4E5A54", fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={28} />
            <YAxis
              tickFormatter={(value) => formatPrice(Number(value))}
              tick={{ fill: "#4E5A54", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
              domain={[(min: number) => Math.floor(min * 0.94), (max: number) => Math.ceil(max * 1.04)]}
            />
            <Tooltip
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 4" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const point = payload[0].payload;
                return (
                  <div className="rounded-[6px] border border-line bg-surface px-2.5 py-1.5 shadow-overlay">
                    <p className="tabular text-[13px] font-semibold text-ink">{formatPrice(point.price)} {priceUnit(product.unit)}</p>
                    <p className="text-[13px] capitalize text-muted">{monthLabel(point.date)}</p>
                  </div>
                );
              }}
            />
            <Area
              type="linear"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-[13px] text-muted">
        {MOCK_SOURCE.label}. {MOCK_SOURCE.note}
      </p>
    </section>
  );
}
