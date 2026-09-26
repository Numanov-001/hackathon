import { useState } from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compareMonths, yearAvg, YEAR_SERIES, type YearKey } from "./data/siatYears";
import { formatPrice } from "./lib/format";
import { cn } from "./lib/cn";

const TABS: Array<{ id: "all" | YearKey; label: string }> = [
  { id: "all", label: "2024–2026" },
  { id: 2024, label: "2024" },
  { id: 2025, label: "2025" },
  { id: 2026, label: "2026" },
];

export default function YearCompare({ productId, productName }: { productId: string; productName: string }) {
  const [tab, setTab] = useState<"all" | YearKey>("all");
  const rows = compareMonths(productId);
  const avg24 = yearAvg(YEAR_SERIES[2024][productId] ?? []);
  const avg25 = yearAvg(YEAR_SERIES[2025][productId] ?? []);
  const avg26 = yearAvg(YEAR_SERIES[2026][productId] ?? []);

  return (
    <section className="rounded-2xl border border-[#E4E7EC] bg-white/92 p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#14213D]">Yillar bo‘yicha narx</h2>
          <p className="text-xs text-[#667085]">{productName} · SIAT 1329 · 1 kg UZS · 2024 va 2026 asosiy taqqos</p>
        </div>
        <div className="flex flex-wrap rounded-xl bg-[#F5FBF7] p-1">
          {TABS.map((item) => (
            <button
              key={String(item.id)}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn("rounded-[10px] px-3 py-1.5 text-xs font-semibold", tab === item.id ? "bg-[#16A05D] text-white" : "text-[#667085]")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <article className="rounded-2xl border border-[#E4E7EC] p-3">
          <p className="text-xs text-[#667085]">2024 o‘rtacha</p>
          <p className="mt-1 text-lg font-bold">{formatPrice(avg24)}</p>
        </article>
        <article className="rounded-2xl border border-[#E4E7EC] p-3">
          <p className="text-xs text-[#667085]">2025 o‘rtacha</p>
          <p className="mt-1 text-lg font-bold">{formatPrice(avg25)}</p>
        </article>
        <article className="rounded-2xl border border-[#E4E7EC] bg-[#F5FBF7] p-3">
          <p className="text-xs text-[#667085]">2026 o‘rtacha</p>
          <p className="mt-1 text-lg font-bold text-[#16A05D]">{formatPrice(avg26)}</p>
        </article>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#E4E7EC" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(value) => formatPrice(Number(value))} width={56} tick={{ fill: "#667085", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value, name) => [`${formatPrice(Number(value))} UZS/kg`, String(name)]} />
            {(tab === "all" || tab === 2024) && <Line type="linear" dataKey="y2024" name="2024" stroke="#14213D" strokeWidth={2} dot={false} connectNulls={false} />}
            {(tab === "all" || tab === 2025) && <Line type="linear" dataKey="y2025" name="2025" stroke="#2E90FA" strokeWidth={2} dot={false} />}
            {(tab === "all" || tab === 2026) && <Line type="linear" dataKey="y2026" name="2026" stroke="#16A05D" strokeWidth={2} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs text-[#667085]">
              <th className="pb-2 font-medium">Oy</th>
              <th className="pb-2 font-medium">2024</th>
              <th className="pb-2 font-medium">2025</th>
              <th className="pb-2 font-medium">2026</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-[#E4E7EC]">
                <td className="py-2 capitalize text-[#667085]">{row.label}</td>
                <td className="py-2 font-medium">{row.y2024 ? `${formatPrice(row.y2024)}` : "—"}</td>
                <td className="py-2 font-medium">{row.y2025 ? `${formatPrice(row.y2025)}` : "—"}</td>
                <td className="py-2 font-semibold text-[#16A05D]">{row.y2026 ? `${formatPrice(row.y2026)}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
