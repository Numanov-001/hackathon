import { useCallback, useEffect, useMemo, useState } from "react";
import BottomBar from "./BottomBar.jsx";
import LeftToolbar from "./LeftToolbar.jsx";
import PriceChart from "./PriceChart.jsx";
import TopToolbar from "./TopToolbar.jsx";
import Watchlist from "./Watchlist.jsx";
import { formatCompact, formatPrice, seriesFor } from "./mockData.js";

const HINTS = {
  trend: "Trend line: click the start point, then the end point.",
  hline: "Horizontal line: click the price you want to mark.",
  measure: "Measure: click the start point, then the end point.",
  erase: "Click the chart to remove lines you added.",
  brush: "Brush stays on the cursor in this view.",
  text: "Text notes stay on the cursor in this view.",
  shape: "Shapes stay on the cursor in this view.",
  zoom: "Scroll or pinch the chart to zoom.",
  lock: "Drawings stay editable in this demo.",
  eye: "Drawings stay visible in this demo.",
};

export default function ChartTerminal() {
  const [symbol, setSymbol] = useState("NDX");
  const [interval, setInterval] = useState("D");
  const [range, setRange] = useState("1Y");
  const [tool, setTool] = useState("cursor");
  const [watchOpen, setWatchOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [legend, setLegend] = useState({ price: 30608.13, change: 129.28, pct: 0.42, volume: 1320000000, blue: null, note: "" });
  const onLegend = useCallback((next) => {
    setLegend((current) => ({ ...current, note: "", ...next }));
  }, []);

  const data = useMemo(() => seriesFor(symbol, interval, range), [symbol, interval, range]);
  const up = legend.change >= 0;

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") setTool("cursor");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function chooseTool(next) {
    setTool(next);
    setStatus(HINTS[next] ?? "");
  }

  return (
    <div className="tv-root flex h-dvh min-h-0 overflow-hidden">
      <div className="hidden md:flex">
        <LeftToolbar tool={tool} onTool={chooseTool} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopToolbar
          quote={data.quote}
          interval={interval}
          onInterval={setInterval}
          onToggleWatch={() => setWatchOpen((open) => !open)}
          status={status}
          onStatus={setStatus}
        />
        <div className="flex min-h-0 flex-1">
          <div className="relative flex min-w-0 flex-1 flex-col">
            <div className="pointer-events-none absolute left-3 top-2 z-10 text-[12px] leading-5">
              <div className="flex flex-wrap items-center gap-x-3">
                {legend.blue != null && (
                  <span className="tv-num font-medium text-[#4aa3df]">{formatPrice(legend.blue, symbol)}</span>
                )}
                <span className="tv-num font-medium text-[#9b4dca]">{formatPrice(legend.price, symbol)}</span>
                <span className={`tv-num ${up ? "text-[#089981]" : "text-[#f23645]"}`}>
                  {up ? "+" : "−"}{formatPrice(Math.abs(legend.change), symbol)} ({up ? "+" : "−"}{Math.abs(legend.pct).toFixed(2)}%)
                </span>
              </div>
              <div className="text-[#787b86]">Vol {formatCompact(legend.volume)}</div>
            </div>
            <div className="min-h-0 flex-1">
              <PriceChart
                bars={data.bars}
                blue={data.blue}
                purple={data.purple}
                volume={data.volume}
                range={range}
                symbol={symbol}
                tool={tool}
                onLegend={onLegend}
              />
            </div>
            <BottomBar range={range} onRange={setRange} />
            {status && (
              <p role="status" className="absolute bottom-11 left-3 z-10 max-w-sm rounded bg-[#131722] px-2 py-1 text-[12px] text-white">
                {status}
              </p>
            )}
          </div>
          <div className="hidden w-[332px] shrink-0 border-l border-[#e0e3eb] xl:block">
            <Watchlist symbol={symbol} onSymbol={setSymbol} />
          </div>
        </div>
      </div>
      <div className="hidden w-10 shrink-0 flex-col items-center gap-2 border-l border-[#e0e3eb] py-2 text-[#787b86] xl:flex" aria-hidden="true">
        <span className="h-4 w-4 rounded-full border border-current" />
        <span className="h-4 w-4 rounded-sm border border-current" />
        <span className="h-4 w-4 rounded-sm border border-current" />
      </div>
      {watchOpen && (
        <div className="fixed inset-0 z-30 flex justify-end bg-[rgba(19,23,34,0.35)] xl:hidden">
          <button type="button" className="h-full flex-1" aria-label="Close watchlist" onClick={() => setWatchOpen(false)} />
          <div className="h-full w-[min(100%,340px)] bg-white shadow-[0_8px_24px_rgba(19,23,34,0.12)]">
            <Watchlist symbol={symbol} onSymbol={(next) => { setSymbol(next); setWatchOpen(false); }} onClose={() => setWatchOpen(false)} />
          </div>
        </div>
      )}
      <button
        type="button"
        className="fixed bottom-12 left-2 z-20 rounded border border-[#e0e3eb] bg-white px-2 py-1 text-[12px] shadow-sm md:hidden"
        onClick={() => setToolsOpen((open) => !open)}
      >
        Tools
      </button>
      {toolsOpen && (
        <div className="fixed bottom-20 left-2 z-20 rounded border border-[#e0e3eb] bg-white shadow-[0_8px_24px_rgba(19,23,34,0.12)] md:hidden">
          <LeftToolbar tool={tool} onTool={(next) => { chooseTool(next); setToolsOpen(false); }} />
        </div>
      )}
    </div>
  );
}
