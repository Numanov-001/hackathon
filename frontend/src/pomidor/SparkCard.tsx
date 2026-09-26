import { TrendingDown, TrendingUp } from "lucide-react";
import MiniSpark from "./MiniSpark";
import { formatPrice, signedPct } from "./lib/format";
import { cn } from "./lib/cn";
import type { ChartPoint } from "./types";

type SparkCardProps = {
  title: string;
  ticker: string;
  price: string;
  change: number;
  data: ChartPoint[];
  onClick?: () => void;
};

export default function SparkCard({ title, ticker, price, change, data, onClick }: SparkCardProps) {
  const up = change >= 0;
  const className = cn(
    "rounded-[10px] border border-line bg-surface p-4 text-left",
    onClick && "transition-colors duration-150 hover:bg-subtle",
  );
  const body = (
    <>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-[13px] text-muted">{ticker}</p>
        </div>
        <div className="text-right">
          <p className="tabular text-sm font-semibold text-ink">{price}</p>
          <p className={cn("tabular inline-flex items-center justify-end gap-0.5 text-[13px] font-semibold", up ? "text-ask" : "text-bid")}>
            {up ? <TrendingUp size={12} strokeWidth={2} aria-hidden="true" /> : <TrendingDown size={12} strokeWidth={2} aria-hidden="true" />}
            {signedPct(change)}
          </p>
        </div>
      </div>
      <MiniSpark data={data} up={up} label={ticker} />
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }
  return <article className={className}>{body}</article>;
}
