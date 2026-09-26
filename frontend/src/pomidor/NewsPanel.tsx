import { MARKET_NEWS } from "./data/news";
import { cn } from "./lib/cn";

const TONE: Record<string, string> = {
  Narx: "bg-soft text-accent",
  Mavsum: "bg-subtle text-ink",
  Qurilish: "bg-subtle text-muted",
  Optom: "bg-soft text-ink",
};

type NewsPanelProps = {
  onOpenProduct: (id: string) => void;
};

export default function NewsPanel({ onOpenProduct }: NewsPanelProps) {
  return (
    <section className="rounded-[10px] border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-base font-semibold text-ink">Mikroyangiliklar</h2>
        <p className="text-[13px] text-muted">Mavsum va drayver. To‘liq lenta emas.</p>
      </div>
      <ul className="divide-y divide-line">
        {MARKET_NEWS.map((item) => {
          const clickable = Boolean(item.productId);
          const Tag = clickable ? "button" : "div";
          return (
            <li key={item.id}>
              <Tag
                type={clickable ? "button" : undefined}
                onClick={clickable ? () => onOpenProduct(item.productId!) : undefined}
                className={cn(
                  "flex w-full gap-3 px-4 py-3 text-left",
                  clickable && "transition-colors duration-150 hover:bg-subtle",
                )}
              >
                <time className="tabular w-12 shrink-0 text-[13px] text-muted" dateTime={item.time}>{item.time}</time>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[13px] font-semibold", TONE[item.category])}>{item.category}</span>
                    <span className="text-sm font-semibold text-ink">{item.title}</span>
                  </span>
                  <span className="block text-[13px] text-muted">{item.summary}</span>
                </span>
              </Tag>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
