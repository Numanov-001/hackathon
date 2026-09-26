import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { market2025 } from "./data/siat2025";
import { formatPrice, signedPct } from "./lib/format";
import { cn } from "./lib/cn";

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

export default function Stats2025({ productId }: { productId: string }) {
  const market = market2025();
  const selected = market.rows.find((row) => row.id === productId) ?? market.rows[0];
  const line = selected.line.filter((point) => point.price > 0).map((point) => ({
    ...point,
    label: MONTHS[Number(point.month.slice(5)) - 1],
  }));
  const bars = [...market.rows].sort((a, b) => b.volume - a.volume).slice(0, 6);
  const ranking = [...market.rows].sort((a, b) => b.volume - a.volume).slice(0, 4);

  return (
    <section className="rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#14213D]">2025 Statistikasi</h2>
          <p className="text-xs text-[#667085]">SIAT 1329 oylik o‘rtacha narxlar · hajm mavsumiy taqsimot bilan hisoblangan</p>
        </div>
        <p className="rounded-full bg-[#EAF8F0] px-3 py-1 text-xs font-semibold text-[#087A45]">{selected.name}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <article className="rounded-2xl border border-[#E4E7EC] bg-[#F5FBF7] p-3">
          <p className="text-xs text-[#667085]">Eng ko‘p sotilgan</p>
          <p className="mt-1 font-semibold text-[#14213D]">{market.topVolume.name}</p>
          <p className="text-xs text-[#667085]">{formatPrice(market.topVolume.volume)} kg</p>
        </article>
        <article className="rounded-2xl border border-[#E4E7EC] p-3">
          <p className="text-xs text-[#667085]">Sotuv hajmi</p>
          <p className="mt-1 font-semibold text-[#14213D]">{formatPrice(selected.volume)} kg</p>
        </article>
        <article className="rounded-2xl border border-[#E4E7EC] p-3">
          <p className="text-xs text-[#667085]">O‘rtacha narx</p>
          <p className="mt-1 font-semibold text-[#14213D]">{formatPrice(selected.avg)} UZS/kg</p>
        </article>
        <article className="rounded-2xl border border-[#E4E7EC] p-3">
          <p className="text-xs text-[#667085]">Yil boshidan</p>
          <p className={cn("mt-1 inline-flex items-center gap-1 font-semibold", selected.yoy >= 0 ? "text-[#16A05D]" : "text-[#F04438]")}>
            {selected.yoy >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {signedPct(selected.yoy)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#E4E7EC] p-3">
          <p className="text-xs text-[#667085]">Eng ko‘p o‘sgan</p>
          <p className="mt-1 font-semibold text-[#16A05D]">{market.topUp.name}</p>
          <p className="text-xs">{signedPct(market.topUp.yoy)}</p>
        </article>
        <article className="rounded-2xl border border-[#E4E7EC] p-3">
          <p className="text-xs text-[#667085]">Eng katta pasayish</p>
          <p className="mt-1 font-semibold text-[#F04438]">{market.topDown.name}</p>
          <p className="text-xs">{signedPct(market.topDown.yoy)}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E4E7EC] p-3">
          <p className="mb-3 text-xs font-medium text-[#667085]">Oylar bo‘yicha narx dinamikasi</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={line} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="y2025" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A05D" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#16A05D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E4E7EC" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => formatPrice(Number(value))} width={56} tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${formatPrice(Number(value))} UZS/kg`, "Narx"]} />
                <Area type="linear" dataKey="price" stroke="#16A05D" strokeWidth={2} fill="url(#y2025)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E4E7EC] p-3">
          <p className="mb-3 text-xs font-medium text-[#667085]">Mahsulotlar bo‘yicha sotuv hajmi</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid stroke="#E4E7EC" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={88} tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${formatPrice(Number(value))} kg`, "Hajm"]} />
                <Bar dataKey="volume" fill="#16A05D" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ol className="relative z-10 mt-6 grid gap-2 sm:grid-cols-2">
        {ranking.map((row, index) => (
          <li key={row.id} className="flex items-center justify-between rounded-xl border border-[#E4E7EC] bg-white px-3 py-2.5 text-sm">
            <span className="text-[#667085]">{index + 1}. {row.name}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", row.yoy >= 0 ? "bg-[#EAF8F0] text-[#087A45]" : "bg-[#FEF3F2] text-[#F04438]")}>
              {signedPct(row.yoy)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
