import { useMemo, useState } from "react";
import { QUOTES, REGIONS, RANGES, SOURCE, formatPrice, quoteBySymbol, seriesFor } from "../tv/mockData.js";
import PriceLine from "./PriceLine.jsx";
import "./desk.css";

const NAV = [
  ["bozor", "Bozor"],
  ["buyurtmalar", "Buyurtmalar"],
  ["mahsulotlar", "Mahsulotlar"],
];

const SEED = [
  { id: "ZX-00012", symbol: "POMIDOR", kg: 20, status: "Yangi", createdAt: "2026-08-31T10:24:00" },
  { id: "ZX-00011", symbol: "BODRING", kg: 15, status: "Tasdiqlandi", createdAt: "2026-08-30T16:12:00" },
  { id: "ZX-00010", symbol: "KARTOSHKA", kg: 50, status: "Yetkazildi", createdAt: "2026-08-29T09:17:00" },
  { id: "ZX-00009", symbol: "PIYOZ", kg: 30, status: "Tasdiqlandi", createdAt: "2026-08-27T14:00:00" },
].map((row) => {
  const quote = quoteBySymbol(row.symbol);
  return {
    ...row,
    name: quote.name,
    emoji: quote.emoji,
    pricePerKg: quote.last,
    total: quote.last * row.kg,
    region: "Toshkent",
    when: row.createdAt.slice(0, 10),
    phone: "+998 90 123 45 67",
  };
});

function signedPct(value) {
  const abs = Math.abs(value).toFixed(1);
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${abs}%`;
}

function chipClass(status) {
  if (status === "Yangi") return "yangi";
  if (status === "Yetkazildi") return "yetkaz";
  return "tasdiq";
}

function rangeLabel(bars, range) {
  const from = rangeStartSafe(bars, range);
  const to = bars.at(-1)?.time;
  if (!from || !to) return "";
  const fmt = (unix) => new Date(unix * 1000).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(from)} – ${fmt(to)}`;
}

function rangeStartSafe(bars, range) {
  const last = bars.at(-1)?.time;
  const day = 86400;
  if (!last) return null;
  if (range === "ALL") return bars[0]?.time;
  if (range === "YTD") return Math.floor(Date.UTC(2026, 0, 1) / 1000);
  const windows = { "1M": 31 * day, "3M": 92 * day, "6M": 183 * day, "1Y": 365 * day };
  return Math.max(bars[0].time, last - (windows[range] ?? 92 * day));
}

export default function DeskApp() {
  const [section, setSection] = useState("bozor");
  const [symbol, setSymbol] = useState("POMIDOR");
  const [range, setRange] = useState("3M");
  const [metric, setMetric] = useState("price");
  const [orders, setOrders] = useState(SEED);
  const [kg, setKg] = useState("20");
  const [region, setRegion] = useState("Toshkent");
  const [when, setWhen] = useState("2026-08-31");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [nextId, setNextId] = useState(13);

  const data = useMemo(() => seriesFor(symbol, "D"), [symbol]);
  const quote = data.quote;
  const volume = Number(kg);
  const total = Number.isFinite(volume) && volume > 0 ? volume * quote.last : 0;
  const up = quote.pct >= 0;
  const lastBar = data.bars.at(-1);
  const avg = Math.round(QUOTES.reduce((sum, item) => sum + item.last, 0) / QUOTES.length);
  const todayCount = orders.length;
  const activeCount = orders.filter((item) => item.status !== "Yetkazildi").length;

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
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Telefon raqamini to‘liq yozing.");
      return;
    }
    const order = {
      id: `ZX-${String(nextId).padStart(5, "0")}`,
      symbol: quote.symbol,
      name: quote.name,
      emoji: quote.emoji,
      kg: volume,
      region,
      when,
      phone,
      note,
      pricePerKg: quote.last,
      total,
      status: "Yangi",
      createdAt: new Date().toISOString(),
    };
    setOrders((current) => [order, ...current]);
    setNextId((value) => value + 1);
    setError("");
    setNote("");
    setPhone("");
    setStatus(`${quote.emoji} ${quote.name}: ${volume} kg zakazga tushdi.`);
    setTimeout(() => setStatus(""), 2400);
  }

  return (
    <div className="desk">
      <header className="desk-top">
        <h1 className="desk-brand">
          <button type="button" onClick={() => setSection("bozor")}>
            <span aria-hidden="true">🍅</span>
            Pomidor
          </button>
        </h1>
        <nav className="desk-nav" aria-label="Asosiy">
          {NAV.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-current={section === id ? "page" : undefined}
              onClick={() => setSection(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="desk-user">
          <button type="button" className="desk-bell" aria-label="Bildirishnomalar">🔔</button>
          <p className="desk-who">
            <strong>Azizbek Xandirov</strong>
            <span>Fermer</span>
          </p>
        </div>
      </header>

      <main className="desk-main">
        {(section === "bozor" || section === "mahsulotlar") && (
          <div className="desk-grid">
            <div className="desk-stack">
              <section className="desk-card desk-hero-row" aria-labelledby="hero-title">
                <div className="desk-hero">
                  <div className="desk-hero-emoji" aria-hidden="true">{quote.emoji}</div>
                  <div>
                    <p className="desk-kicker" id="hero-title">{quote.name} narxi</p>
                    <p className="desk-price num">{formatPrice(quote.last)} UZS/kg</p>
                    <p className={`desk-change ${up ? "up" : "down"}`}>
                      {signedPct(quote.pct)}
                      <span>oxirgi INI o‘zgarishi</span>
                    </p>
                  </div>
                </div>
                <div className="desk-ranges" role="group" aria-label="Davr">
                  {RANGES.map((item) => (
                    <button key={item} type="button" aria-pressed={range === item} onClick={() => setRange(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              <section className="desk-card" aria-labelledby="chart-title">
                <div className="desk-chart-head">
                  <h2 id="chart-title">Narx grafigi</h2>
                  <div className="desk-tabs" role="group" aria-label="Grafik turi">
                    <button type="button" aria-pressed={metric === "price"} onClick={() => setMetric("price")}>Narx (UZS/kg)</button>
                    <button type="button" aria-pressed={metric === "volume"} onClick={() => setMetric("volume")}>Hajm (kg)</button>
                  </div>
                  <p className="desk-date">{rangeLabel(data.bars, range)}</p>
                </div>
                <div className="desk-chart-wrap">
                  <PriceLine bars={data.bars} range={range} metric={metric} />
                  {metric === "price" && lastBar && (
                    <p className="desk-last-pill">
                      <strong className="num">{formatPrice(lastBar.close)} UZS/kg</strong>
                      <span>{new Date(lastBar.time * 1000).toLocaleDateString("uz-UZ")}</span>
                    </p>
                  )}
                </div>
              </section>
            </div>

            <aside className="desk-card" aria-labelledby="list-title">
              <div className="desk-list-head">
                <h2 id="list-title">Mahsulotlar</h2>
                <p>barchasi</p>
              </div>
              <ul className="desk-products">
                {QUOTES.map((item) => {
                  const itemUp = item.pct >= 0;
                  return (
                    <li key={item.symbol}>
                      <button type="button" aria-current={item.symbol === symbol} onClick={() => { setSymbol(item.symbol); setSection("bozor"); }}>
                        <span>{item.emoji} {item.name}</span>
                        <span className="num">{formatPrice(item.last)}</span>
                        <span className={`desk-change ${itemUp ? "up" : "down"}`}>{signedPct(item.pct)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        )}

        {(section === "bozor" || section === "buyurtmalar") && (
          <div className="desk-lower">
            <section className="desk-card" aria-labelledby="form-title">
              <h2 id="form-title">Buyurtma yaratish</h2>
              <p className="desk-kicker">Kerakli mahsulotni tanlang va buyurtma yuboring.</p>
              <form onSubmit={submit}>
                <div className="desk-form-grid">
                  <label className="desk-field">
                    Mahsulot
                    <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                      {QUOTES.map((item) => (
                        <option key={item.symbol} value={item.symbol}>{item.emoji} {item.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="desk-field">
                    Hajm (kg)
                    <input type="number" min="1" step="1" value={kg} onChange={(e) => setKg(e.target.value)} />
                  </label>
                  <label className="desk-field">
                    Viloyat
                    <select value={region} onChange={(e) => setRegion(e.target.value)}>
                      {REGIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="desk-field">
                    Olish sanasi
                    <input type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
                  </label>
                  <label className="desk-field">
                    Telefon
                    <input type="tel" placeholder="+998 90 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </label>
                  <label className="desk-field">
                    Izoh (ixtiyoriy)
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Masalan: 12:00 gacha yetkazilsin" />
                  </label>
                </div>
                {error && <p className="desk-error" role="alert">{error}</p>}
                <div className="desk-form-foot">
                  <p className="desk-total">
                    {formatPrice(total)} UZS
                    <span>{volume || 0} kg × {formatPrice(quote.last)} UZS/kg</span>
                  </p>
                  <button type="submit" className="desk-buy">Sotib olish</button>
                </div>
              </form>
            </section>

            <div className="desk-stack">
              <div className="desk-stats">
                <section className="desk-card desk-stat">
                  <h3>Bugungi zakazlar</h3>
                  <p className="num">{String(todayCount).padStart(2, "0")}</p>
                  <small>+{orders.filter((item) => item.status === "Yangi").length} ta yangi</small>
                </section>
                <section className="desk-card desk-stat">
                  <h3>Faol zakazlar</h3>
                  <p className="num">{String(activeCount).padStart(2, "0")}</p>
                  <small>yetkazilmagan</small>
                </section>
                <section className="desk-card desk-stat">
                  <h3>Bugungi o‘rtacha narx</h3>
                  <p className="num">{formatPrice(avg)}</p>
                  <small>UZS/kg · 10 mahsulot</small>
                </section>
              </div>

              <section className="desk-card" aria-labelledby="orders-title">
                <div className="desk-list-head">
                  <div>
                    <h2 id="orders-title">Mening zakazlarim</h2>
                    <p className="desk-kicker">Yangi buyurtma yuqorida ko‘rinadi.</p>
                  </div>
                  <p>barchasi</p>
                </div>
                {orders.length === 0 ? (
                  <div className="desk-empty">
                    <div className="desk-empty-icon" aria-hidden="true">📦</div>
                    <p>Hozircha buyurtma yo‘q</p>
                    <button type="button" className="desk-buy" onClick={() => setSection("bozor")}>Buyurtma qilish</button>
                  </div>
                ) : (
                  <div className="desk-table-wrap">
                    <table className="desk-table">
                      <thead>
                        <tr>
                          <th>Zakaz ID</th>
                          <th>Mahsulot</th>
                          <th>Hajm</th>
                          <th>Summa</th>
                          <th>Holat</th>
                          <th>Sana</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="num">{order.id}</td>
                            <td>{order.emoji} {order.name}</td>
                            <td className="num">{order.kg} kg</td>
                            <td className="num">{formatPrice(order.total)}</td>
                            <td><span className={`desk-chip ${chipClass(order.status)}`}>{order.status}</span></td>
                            <td className="num">{new Date(order.createdAt).toLocaleString("uz-UZ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <footer className="desk-foot">
        <p>{SOURCE.note}</p>
        <p>Mahalliy mahsulotlar · bozor narxi</p>
      </footer>
      {status && <p className="desk-status" role="status">{status}</p>}
    </div>
  );
}
