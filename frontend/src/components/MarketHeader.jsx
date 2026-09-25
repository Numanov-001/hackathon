import { money, sparklinePoints, volume } from "../utils/format";

function Sparkline({ values, up }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 92;
  const h = 36;
  const d = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * w;
      const y = h - ((value - min) / span) * (h - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={d} fill="none" stroke={up ? "var(--color-ask)" : "var(--color-bid)"} strokeWidth="1.6" />
    </svg>
  );
}

export default function MarketHeader({ product, unit, summary, lastPrice, change, forecast, askVolume, history }) {
  const activity = (summary?.active_asks || 0) + (summary?.active_bids || 0);
  const level = activity >= 8 ? "High" : activity >= 4 ? "Moderate" : "Low";
  const up = change == null || change >= 0;
  return (
    <section className="header card" id="analytics">
      <div className="product-id">
        <div className="product-mark" aria-hidden="true">{product.slice(0, 1)}</div>
        <div>
          <p className="eyebrow">Summary</p>
          <h1>{product}</h1>
          <div className="stat">{unit || "UZS / kg"}</div>
        </div>
      </div>
      <div>
        <div className={`price num ${up ? "ask" : "bid"}`}>{money(lastPrice)}</div>
        <div className={up ? "ask" : "bid"}>
          {change == null ? "—" : `${up ? "+" : ""}${change.toFixed(1)}%`}
          {forecast ? ` · ${forecast.trend}` : ""}
        </div>
      </div>
      <div className="stats">
        <div className="stat">Best Ask<b className="num ask">{money(summary?.best_ask)}</b></div>
        <div className="stat">Best Bid<b className="num bid">{money(summary?.best_bid)}</b></div>
        <div className="stat">Spread<b className="num">{money(summary?.spread)}</b></div>
        <div className="stat">Ask volume<b className="num">{volume(askVolume)} kg</b></div>
        <div className="stat">Activity<b>{level}</b></div>
        <Sparkline values={sparklinePoints(history)} up={up} />
      </div>
    </section>
  );
}
