import { useEffect, useRef, useState } from "react";
import { GLYPH, Icon } from "./icons.jsx";

const INTERVALS = [
  ["D", "1D"],
  ["W", "1W"],
  ["M", "1M"],
];

export default function TopToolbar({ quote, interval, onInterval, onToggleWatch, status, onStatus }) {
  const [tradeOpen, setTradeOpen] = useState(false);
  const tradeRef = useRef(null);

  useEffect(() => {
    function onDoc(event) {
      if (!tradeRef.current?.contains(event.target)) setTradeOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="flex h-10 shrink-0 items-center gap-1 border-b border-[#e0e3eb] bg-white px-2">
      <button type="button" className="rounded px-2 py-1 text-[13px] font-semibold hover:bg-[#f0f3fa]" aria-label="Symbol">
        {quote.symbol}
      </button>
      <div className="hidden min-w-0 items-center gap-2 truncate text-[13px] sm:flex">
        <span className="truncate font-medium">{quote.name}</span>
        <span className="text-[#787b86]">· {interval === "D" ? "1D" : interval === "W" ? "1W" : "1M"}</span>
        {quote.exchange && <span className="text-[#787b86]">· {quote.exchange}</span>}
      </div>
      <span className="mx-1 hidden h-4 w-px bg-[#e0e3eb] md:block" />
      <button type="button" className="hidden rounded p-1.5 text-[#787b86] hover:bg-[#f0f3fa] md:grid" aria-label="Compare">
        <Icon d={GLYPH.compare} />
      </button>
      <div className="flex items-center" role="group" aria-label="Interval">
        {INTERVALS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={interval === id}
            onClick={() => onInterval(id)}
            className={`rounded px-2 py-1 text-[13px] hover:bg-[#f0f3fa] ${interval === id ? "font-semibold text-[#131722]" : "text-[#787b86]"}`}
          >
            {label === "1D" ? "D" : label === "1W" ? "W" : "M"}
          </button>
        ))}
      </div>
      <button type="button" className="hidden items-center gap-1 rounded px-2 py-1 text-[13px] text-[#131722] hover:bg-[#f0f3fa] lg:flex" onClick={() => onStatus(status === "Indicators" ? "" : "SMA is drawn from the daily closes in this mock series.")}>
        <Icon d={GLYPH.indicator} /> Indicators
      </button>
      <button type="button" className="hidden rounded p-1.5 text-[#787b86] hover:bg-[#f0f3fa] lg:grid" aria-label="Alert" onClick={() => onStatus("Alert saved for this symbol. This demo does not send notifications.")}>
        <Icon d={GLYPH.bell} />
      </button>
      <button type="button" className="hidden items-center gap-1 rounded px-2 py-1 text-[13px] text-[#787b86] hover:bg-[#f0f3fa] lg:flex" onClick={() => onStatus("Replay uses the loaded mock series. Drag the chart to move through it.")}>
        <Icon d={GLYPH.replay} /> Replay
      </button>
      <div className="ml-auto flex items-center gap-1">
        <span className="hidden text-[13px] text-[#787b86] xl:inline">Unnamed</span>
        <button type="button" className="hidden rounded p-1.5 text-[#787b86] hover:bg-[#f0f3fa] md:grid" aria-label="Save layout" onClick={() => onStatus("Layout kept in this session only.")}>
          <Icon d={GLYPH.save} />
        </button>
        <button type="button" className="rounded p-1.5 text-[#787b86] hover:bg-[#f0f3fa] xl:hidden" aria-label="Watchlist" onClick={onToggleWatch}>
          <Icon d={GLYPH.layout} />
        </button>
        <div className="relative" ref={tradeRef}>
          <button type="button" className="rounded border border-[#e0e3eb] px-3 py-1 text-[13px] font-medium hover:bg-[#f0f3fa]" aria-expanded={tradeOpen} onClick={() => setTradeOpen((open) => !open)}>
            Trade
          </button>
          {tradeOpen && (
            <div className="absolute right-0 z-20 mt-1 w-44 rounded border border-[#e0e3eb] bg-white p-2 shadow-[0_8px_24px_rgba(19,23,34,0.12)]" role="dialog" aria-label="Quick order">
              <p className="mb-2 text-[12px] text-[#787b86]">Demo order at the last price. Nothing is sent to a broker.</p>
              <div className="grid grid-cols-2 gap-1">
                <button type="button" className="rounded bg-[#2962ff] px-2 py-1.5 text-[13px] font-semibold text-white" onClick={() => { onStatus(`Buy ticket staged for ${quote.symbol}.`); setTradeOpen(false); }}>Buy</button>
                <button type="button" className="rounded bg-[#f23645] px-2 py-1.5 text-[13px] font-semibold text-white" onClick={() => { onStatus(`Sell ticket staged for ${quote.symbol}.`); setTradeOpen(false); }}>Sell</button>
              </div>
            </div>
          )}
        </div>
        <button type="button" className="rounded bg-[#131722] px-3 py-1 text-[13px] font-semibold text-white hover:bg-[#2a2e39]" onClick={() => onStatus("Chart published to this session.")}>
          Publish
        </button>
      </div>
    </header>
  );
}
