import { useState } from "react";
import { QUOTES, REGIONS, formatPrice } from "./mockData.js";

function signedPct(value) {
  const abs = Math.abs(value).toFixed(1);
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${abs}%`;
}

export default function Watchlist({ symbol, onSymbol, quote, onBuy, onClose }) {
  const [kg, setKg] = useState("20");
  const [region, setRegion] = useState("Toshkent");
  const [when, setWhen] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const volume = Number(kg);
  const total = Number.isFinite(volume) && volume > 0 ? volume * quote.last : 0;

  function submit(event) {
    event.preventDefault();
    if (!Number.isFinite(volume) || volume < 1) {
      setError("Kamida 1 kg kiriting.");
      return;
    }
    if (!when) {
      setError("Olish sanasini tanlang.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      setError("Telefon raqamini to‘liq yozing.");
      return;
    }
    setError("");
    onBuy({
      id: `${Date.now()}-${quote.symbol}`,
      symbol: quote.symbol,
      name: quote.name,
      emoji: quote.emoji,
      kg: volume,
      region,
      when,
      phone,
      pricePerKg: quote.last,
      total,
      status: "Qabul qilindi",
      createdAt: new Date().toISOString(),
    });
    setKg("20");
    setPhone("");
  }

  return (
    <aside className="flex h-full w-full flex-col bg-white" aria-label="Mahsulotlar">
      <div className="flex items-center justify-between border-b border-[#e0e3eb] px-3 py-2">
        <h2 className="text-[13px] font-medium">Mahsulotlar</h2>
        {onClose && (
          <button type="button" className="text-[12px] text-[#787b86] xl:hidden" onClick={onClose}>Yopish</button>
        )}
      </div>
      <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr] px-3 py-1 text-[11px] text-[#787b86]">
        <span>Mahsulot</span>
        <span className="text-right">UZS / kg</span>
        <span className="text-right">Oy</span>
      </div>
      <ul className="min-h-0 flex-1 overflow-auto">
        {QUOTES.map((item) => {
          const up = item.change >= 0;
          const selected = item.symbol === symbol;
          return (
            <li key={item.symbol}>
              <button
                type="button"
                onClick={() => onSymbol(item.symbol)}
                aria-current={selected ? "true" : undefined}
                className={`grid w-full grid-cols-[1.4fr_0.9fr_0.8fr] items-center px-3 py-1.5 text-left text-[12px] hover:bg-[#f0f3fa] ${selected ? "bg-[#f0f3fa]" : ""}`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.name}
                </span>
                <span className="tv-num text-right">{formatPrice(item.last)}</span>
                <span className={`tv-num text-right ${up ? "text-[#089981]" : "text-[#f23645]"}`}>{signedPct(item.pct)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <section className="border-t border-[#e0e3eb] px-3 py-3">
        <p className="text-[13px] font-medium">
          <span aria-hidden="true">{quote.emoji} </span>
          {quote.name}
        </p>
        <p className="tv-num mt-1 text-[24px] font-semibold leading-none">{formatPrice(quote.last)}</p>
        <p className="mt-1 text-[12px] text-[#787b86]">UZS / kg · stat.uz INI asosida</p>
        <form className="mt-3 grid gap-2" onSubmit={submit}>
          <label className="grid gap-1 text-[12px] text-[#787b86]">
            Hajm (kg)
            <input type="number" min="1" step="1" value={kg} onChange={(e) => setKg(e.target.value)} className="rounded-md border border-[#e0e3eb] px-2 py-1.5 text-[13px] text-[#131722]" />
          </label>
          <label className="grid gap-1 text-[12px] text-[#787b86]">
            Viloyat
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-md border border-[#e0e3eb] px-2 py-1.5 text-[13px] text-[#131722]">
              {REGIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-[12px] text-[#787b86]">
            Olish sanasi
            <input type="date" value={when} onChange={(e) => setWhen(e.target.value)} className="rounded-md border border-[#e0e3eb] px-2 py-1.5 text-[13px] text-[#131722]" />
          </label>
          <label className="grid gap-1 text-[12px] text-[#787b86]">
            Telefon
            <input type="tel" placeholder="+998 90 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-md border border-[#e0e3eb] px-2 py-1.5 text-[13px] text-[#131722]" />
          </label>
          <p className="tv-num text-[12px] text-[#131722]">Jami: {formatPrice(total)} UZS</p>
          {error && <p className="text-[12px] font-semibold text-[#f23645]" role="alert">{error}</p>}
          <button type="submit" className="rounded-md bg-[#146b43] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#0f5534]">
            Sotib olish
          </button>
        </form>
      </section>
    </aside>
  );
}
