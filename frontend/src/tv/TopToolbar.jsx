const INTERVALS = [
  ["D", "1D"],
  ["W", "1W"],
  ["M", "1M"],
];

export default function TopToolbar({ quote, interval, onInterval, onToggleWatch }) {
  return (
    <header className="flex h-10 shrink-0 items-center gap-1 border-b border-[#e0e3eb] bg-white px-2">
      <p className="truncate px-2 text-[13px] font-semibold">
        <span aria-hidden="true">{quote.emoji} </span>
        {quote.name}
        <span className="ml-2 font-normal text-[#787b86]">UZS / kg</span>
      </p>
      <div className="flex items-center" role="group" aria-label="Vaqt oralig‘i">
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
      <button type="button" className="ml-auto rounded border border-[#e0e3eb] px-3 py-1 text-[13px] font-medium hover:bg-[#f0f3fa] xl:hidden" onClick={onToggleWatch}>
        Mahsulotlar
      </button>
    </header>
  );
}
