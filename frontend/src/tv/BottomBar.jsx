import { useEffect, useState } from "react";
import { RANGES } from "./mockData.js";

function utcStamp(date) {
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss} UTC`;
}

export default function BottomBar({ range, onRange }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="flex h-9 shrink-0 items-center gap-1 border-t border-[#e0e3eb] bg-white px-2">
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" role="group" aria-label="Date range">
        {RANGES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={range === item}
            onClick={() => onRange(item)}
            className={`shrink-0 rounded px-1.5 py-1 text-[12px] hover:bg-[#f0f3fa] ${range === item ? "bg-[#f0f3fa] font-semibold text-[#131722]" : "text-[#787b86]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <time className="tv-num shrink-0 px-2 text-[12px] text-[#787b86]" dateTime={now.toISOString()}>{utcStamp(now)}</time>
    </footer>
  );
}
