import { Calendar } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SIAT_SOURCE } from "./data/siat";
import { formatPrice } from "./lib/format";
import type { Product } from "./types";

const MONTHS_UZ = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

function monthTick(value: string) {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return `${MONTHS_UZ[date.getMonth()]} ${date.getFullYear()}`;
}

function monthLabel(value: string) {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return date.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" });
}

export default function PriceChartCard({ product }: { product: Product }) {
  const data = product.chartData.filter((point) => point.price > 0);
  const last = data.at(-1);
  const first = data[0];

  return (
    <section className="rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#14213D]">Narx grafigi</h2>
          <p className="text-xs text-[#667085]">Oylik o‘rtacha · UZS/kg</p>
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7EC] px-3 py-1.5 text-xs text-[#667085]">
          <Calendar size={14} strokeWidth={1.8} />
          {first && last ? `${monthTick(first.date)} – ${monthTick(last.date)}` : "12 oy"}
        </p>
      </div>
      <div className="h-[420px] w-full min-w-0 lg:h-[560px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="siatFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A05D" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#16A05D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E4E7EC" vertical={false} />
            <XAxis dataKey="date" tickFormatter={monthTick} tick={{ fill: "#667085", fontSize: 12 }} axisLine={false} tickLine={false} interval={0} />
            <YAxis
              tickFormatter={(value) => formatPrice(Number(value))}
              tick={{ fill: "#667085", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={78}
              domain={[(min: number) => Math.floor(min * 0.92), (max: number) => Math.ceil(max * 1.06)]}
            />
            <Tooltip
              cursor={{ stroke: "#16A05D", strokeWidth: 1, strokeDasharray: "3 4" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const point = payload[0].payload;
                return (
                  <div className="rounded-lg border border-[#E4E7EC] bg-white px-2.5 py-1.5 shadow-[0_8px_20px_rgba(16,24,40,0.10)]">
                    <p className="text-[13px] font-bold leading-tight text-[#14213D]">{formatPrice(point.price)} UZS/kg</p>
                    <p className="text-[11px] capitalize text-[#667085]">{monthLabel(point.date)}</p>
                  </div>
                );
              }}
            />
            <Area
              type="linear"
              dataKey="price"
              stroke="#16A05D"
              strokeWidth={2}
              fill="url(#siatFill)"
              isAnimationActive={false}
              activeDot={{ r: 5, fill: "#16A05D", stroke: "#fff", strokeWidth: 2 }}
              dot={{ r: 3, fill: "#16A05D", stroke: "#fff", strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-[#667085]">
        <a href={SIAT_SOURCE.url} className="text-[#087A45] underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
          {SIAT_SOURCE.label}
        </a>
        {" · "}
        SIAT {SIAT_SOURCE.dataset}
      </p>
    </section>
  );
}
