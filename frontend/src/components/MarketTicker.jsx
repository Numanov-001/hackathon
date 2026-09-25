import { money } from "../utils/format";

export default function MarketTicker({ items, historyByProduct }) {
  return (
    <div className="ticker" aria-label="Market ticker">
      {items.map((item) => {
        const hist = historyByProduct?.[item.product];
        const change = hist?.pct;
        const up = change == null || change >= 0;
        return (
          <span key={item.product}>
            {item.product.toUpperCase()}
            <b className="num">{money(item.bestAsk)}</b>
            <span className={up ? "up" : "down"}>
              {change == null ? "—" : `${up ? "▲" : "▼"}${Math.abs(change).toFixed(1)}%`}
            </span>
          </span>
        );
      })}
    </div>
  );
}
