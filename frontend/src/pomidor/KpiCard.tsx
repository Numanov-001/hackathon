import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  trend: string;
  trendTone?: "up" | "down" | "neutral";
};

export default function KpiCard({ icon: Icon, title, value, trend, trendTone = "up", delay = 0 }: KpiCardProps & { delay?: number }) {
  const tone = trendTone === "down" ? "text-[#F04438]" : trendTone === "up" ? "text-[#16A05D]" : "text-[#667085]";
  return (
    <article
      style={{ "--enter": `${delay}ms` } as CSSProperties}
      className="enter rounded-2xl border border-[#E4E7EC] bg-white px-5 py-6 shadow-[0_2px_10px_rgba(16,24,40,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,24,40,0.06)]"
    >
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-[#EAF8F0] text-[#087A45]">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <h3 className="text-xs font-medium text-[#667085]">{title}</h3>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#14213D]">{value}</p>
      <p className={`mt-1 text-xs font-semibold ${tone}`}>{trend}</p>
    </article>
  );
}
