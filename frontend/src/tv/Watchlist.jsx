import { GLYPH, Icon } from "./icons.jsx";
import { PERFORMANCE, QUOTES, formatPrice } from "./mockData.js";

function signed(value, digits = 2) {
  const text = new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Math.abs(value));
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${text}`;
}

export default function Watchlist({ symbol, onSymbol, onClose }) {
  const groups = ["Indices", "Stocks", "Futures"];
  const active = QUOTES.find((item) => item.symbol === symbol) ?? QUOTES.at(-1);
  return (
    <aside className="flex h-full w-full flex-col bg-white" aria-label="Watchlist">
      <div className="flex items-center justify-between border-b border-[#e0e3eb] px-3 py-2">
        <button type="button" className="flex items-center gap-1 text-[13px] font-medium">
          Watchlist <Icon d={GLYPH.chevron} className="h-3.5 w-3.5 text-[#787b86]" />
        </button>
        {onClose && (
          <button type="button" className="text-[12px] text-[#787b86] xl:hidden" onClick={onClose}>Close</button>
        )}
      </div>
      <div className="grid grid-cols-[1.2fr_0.9fr_0.7fr_0.7fr] px-3 py-1 text-[11px] text-[#787b86]">
        <span>Symbol</span>
        <span className="text-right">Last</span>
        <span className="text-right">Chg</span>
        <span className="text-right">Chg%</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {groups.map((group) => (
          <section key={group}>
            <h2 className="px-3 py-1 text-[11px] font-medium tracking-wide text-[#787b86]">{group.toUpperCase()}</h2>
            <ul>
              {QUOTES.filter((item) => item.group === group).map((item) => {
                const up = item.change >= 0;
                const selected = item.symbol === symbol;
                return (
                  <li key={item.symbol}>
                    <button
                      type="button"
                      onClick={() => onSymbol(item.symbol)}
                      aria-current={selected ? "true" : undefined}
                      className={`grid w-full grid-cols-[1.2fr_0.9fr_0.7fr_0.7fr] items-center px-3 py-1 text-left text-[12px] hover:bg-[#f0f3fa] ${selected ? "bg-[#f0f3fa]" : ""}`}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full" style={{ background: item.dot }} />
                        {item.symbol}
                      </span>
                      <span className="tv-num text-right">{formatPrice(item.last, item.symbol)}</span>
                      <span className={`tv-num text-right ${up ? "text-[#089981]" : "text-[#f23645]"}`}>{signed(item.change, item.symbol === "DXY" ? 3 : 2)}</span>
                      <span className={`tv-num text-right ${up ? "text-[#089981]" : "text-[#f23645]"}`}>{signed(item.pct)}%</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <section className="border-t border-[#e0e3eb] px-3 py-3">
          <p className="text-[12px] text-[#787b86]">{active.name}{active.exchange ? ` · ${active.exchange}` : ""}</p>
          <p className="tv-num mt-1 text-[28px] font-semibold leading-none">{formatPrice(active.last, active.symbol)}</p>
          <p className={`tv-num mt-1 text-[13px] ${active.change >= 0 ? "text-[#089981]" : "text-[#f23645]"}`}>
            {signed(active.change)} {signed(active.pct)}%
          </p>
          <p className="mt-2 text-[12px] text-[#f23645]">Market closed</p>
          <p className="text-[11px] text-[#787b86]">Last update at 20:59 GMT−5</p>
          {active.symbol === "NDX" ? (
            <article className="mt-3 rounded bg-[#f3e8ff] px-2 py-2 text-[12px] leading-snug text-[#131722]">
              <p className="text-[11px] text-[#787b86]">News · 9 hours ago</p>
              Wall St set for a higher open as AI enthusiasm eases worries over higher oil prices and yields.
              <button type="button" className="mt-1 block text-[#2962ff]">More events</button>
            </article>
          ) : (
            <p className="mt-3 text-[12px] text-[#787b86]">No headlines for this symbol.</p>
          )}
          <h2 className="mb-2 mt-4 text-[13px] font-medium">Performance</h2>
          <div className="grid grid-cols-3 gap-1.5">
            {PERFORMANCE.map(([label, value]) => (
              <div key={label} className="rounded bg-[#e8f7f3] px-1 py-1 text-center">
                <div className="text-[10px] text-[#787b86]">{label}</div>
                <div className="tv-num text-[12px] font-semibold text-[#089981]">{value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
