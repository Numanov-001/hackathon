import { useCallback, useMemo, useState } from "react";
import BottomBar from "./BottomBar.jsx";
import OrderTable from "./OrderTable.jsx";
import PriceChart from "./PriceChart.jsx";
import TopToolbar from "./TopToolbar.jsx";
import Watchlist from "./Watchlist.jsx";
import { SOURCE, formatPrice, seriesFor } from "./mockData.js";

export default function ChartTerminal() {
  const [symbol, setSymbol] = useState("POMIDOR");
  const [interval, setInterval] = useState("D");
  const [range, setRange] = useState("1Y");
  const [watchOpen, setWatchOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [legend, setLegend] = useState({ price: 0, change: 0, pct: 0, blue: null });
  const onLegend = useCallback((next) => {
    setLegend((current) => ({ ...current, ...next }));
  }, []);

  const data = useMemo(() => seriesFor(symbol, interval), [symbol, interval]);
  const up = legend.change >= 0;

  function addOrder(order) {
    setOrders((current) => [order, ...current]);
    setStatus(`${order.emoji} ${order.name}: ${order.kg} kg zakazga tushdi.`);
    setTimeout(() => setStatus(""), 2400);
  }

  const panel = (
    <Watchlist
      symbol={symbol}
      quote={data.quote}
      onSymbol={setSymbol}
      onBuy={addOrder}
    />
  );

  return (
    <div className="tv-root flex h-dvh min-h-0 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <TopToolbar
          quote={data.quote}
          interval={interval}
          onInterval={setInterval}
          onToggleWatch={() => setWatchOpen((open) => !open)}
        />
        <div className="flex min-h-0 flex-1">
          <div className="relative flex min-w-0 flex-1 flex-col">
            <div className="pointer-events-none absolute left-3 top-2 z-10 text-[12px] leading-5">
              <div className="flex flex-wrap items-center gap-x-3">
                {legend.blue != null && (
                  <span className="tv-num font-medium text-[#4aa3df]">{formatPrice(legend.blue)}</span>
                )}
                <span className="tv-num font-medium text-[#9b4dca]">{formatPrice(legend.price)}</span>
                <span className={`tv-num ${up ? "text-[#089981]" : "text-[#f23645]"}`}>
                  {up ? "+" : "−"}{formatPrice(Math.abs(legend.change))} ({up ? "+" : "−"}{Math.abs(legend.pct).toFixed(2)}%)
                </span>
                <span className="text-[#787b86]">UZS / kg</span>
              </div>
              <p className="max-w-[42rem] text-[11px] text-[#787b86]">{SOURCE.note}</p>
            </div>
            <div className="min-h-0 flex-1">
              <PriceChart
                bars={data.bars}
                blue={data.blue}
                purple={data.purple}
                range={range}
                symbol={symbol}
                onLegend={onLegend}
              />
            </div>
            <OrderTable orders={orders} />
            <BottomBar range={range} onRange={setRange} />
            {status && (
              <p role="status" className="absolute bottom-28 left-3 z-10 max-w-sm rounded bg-[#131722] px-2 py-1 text-[12px] text-white">
                {status}
              </p>
            )}
          </div>
          <div className="hidden w-[332px] shrink-0 border-l border-[#e0e3eb] xl:block">
            {panel}
          </div>
        </div>
      </div>
      {watchOpen && (
        <div className="fixed inset-0 z-30 flex justify-end bg-[rgba(19,23,34,0.35)] xl:hidden">
          <button type="button" className="h-full flex-1" aria-label="Mahsulotlarni yopish" onClick={() => setWatchOpen(false)} />
          <div className="h-full w-[min(100%,340px)] bg-white shadow-[0_8px_24px_rgba(19,23,34,0.12)]">
            <Watchlist
              symbol={symbol}
              quote={data.quote}
              onSymbol={(next) => { setSymbol(next); }}
              onBuy={(order) => { addOrder(order); setWatchOpen(false); }}
              onClose={() => setWatchOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
