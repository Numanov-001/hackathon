import { TrendingDown, TrendingUp } from "lucide-react";
import { YEAR_SERIES, yearAvg } from "./data/siatYears";
import { formatPrice, signedPct } from "./lib/format";
import { cn } from "./lib/cn";
import type { Product } from "./types";

export default function PriceSummary({ product }: { product: Product }) {
  const up = product.change >= 0;
  const avg24 = yearAvg(YEAR_SERIES[2024][product.id] ?? []);
  const avg25 = yearAvg(YEAR_SERIES[2025][product.id] ?? []);
  const avg26 = yearAvg(YEAR_SERIES[2026][product.id] ?? []);
  return (
    <section className="rounded-2xl border border-[#E4E7EC] bg-white/92 px-6 py-6 shadow-[0_2px_10px_rgba(16,24,40,0.04)] backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={product.image} alt="" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-[#E4E7EC]" />
          <div>
            <p className="text-sm font-semibold text-[#14213D]">{product.name}</p>
            <p className="text-xs text-[#667085]">O‘rtacha do‘kon narxi · so‘nggi oy</p>
            <p className="mt-1 text-[32px] font-bold leading-none tracking-tight text-[#14213D]">{formatPrice(product.price)} UZS/kg</p>
            <p className={cn("mt-2 inline-flex items-center gap-1 text-sm font-semibold", up ? "text-[#16A05D]" : "text-[#F04438]")}>
              {up ? <TrendingUp size={16} strokeWidth={1.8} /> : <TrendingDown size={16} strokeWidth={1.8} />}
              {signedPct(product.change)}
              <span className="font-medium text-[#667085]">(oxirgi oyga nisbatan)</span>
            </p>
          </div>
        </div>
        <div className="grid gap-2 text-right text-xs">
          <p className="rounded-xl border border-[#E4E7EC] px-3 py-2 font-semibold text-[#14213D]">2024 · {formatPrice(avg24)} UZS/kg</p>
          <p className="rounded-xl border border-[#E4E7EC] px-3 py-2 font-semibold text-[#2E90FA]">2025 · {formatPrice(avg25)} UZS/kg</p>
          <p className="rounded-xl bg-[#EAF8F0] px-3 py-2 font-semibold text-[#087A45]">2026 · {formatPrice(avg26)} UZS/kg</p>
        </div>
      </div>
    </section>
  );
}
