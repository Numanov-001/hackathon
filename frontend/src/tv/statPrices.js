/**
 * Oylik foizlar: O‘zbekiston Milliy statistika qo‘mitasi INI press-relizlari
 * (stat.uz, 2026-yil yanvar–avgust).
 * Qo‘mita kg narxini doimiy jadval qilib bermaydi — foizdan UZS/kg qayta hisoblanadi.
 * Baza: 2025-yil dekabr, respublika bozorida keng uchraydigan o‘rtacha iste’mol darajasi.
 */

const SOURCE = {
  title: "stat.uz — iste’mol narxlari indeksi (INI)",
  url: "https://stat.uz/uz/",
  note: "Grafik Milliy statistika qo‘mitasining oylik foizlariga asoslangan. Kg narxi press-relizdagi % bilan qayta hisoblangan.",
};

const MONTHS = [
  "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02", "2026-03", "2026-04",
  "2026-05", "2026-06", "2026-07", "2026-08",
];

const BASE = {
  POMIDOR: 9000,
  BODRING: 8500,
  KARTOSHKA: 6000,
  PIYOZ: 4000,
  SABZI: 3500,
  QALAMPIR: 10000,
  KARAM: 2500,
  OLMA: 10000,
  UZUM: 14000,
  TARVUZ: 2800,
};

const MOM = {
  POMIDOR: { "2026-01": -2.1, "2026-02": 12.1, "2026-05": -34.7, "2026-07": -24.0 },
  BODRING: { "2026-02": -13.8, "2026-05": -39.5, "2026-07": -10.6 },
  KARTOSHKA: { "2026-01": 1.9, "2026-02": 5.0, "2026-05": -1.1, "2026-07": -18.0, "2026-08": -3.3 },
  PIYOZ: { "2026-01": 1.2, "2026-02": -0.9, "2026-05": -2.9, "2026-07": 1.7, "2026-08": 6.2 },
  SABZI: { "2026-01": 1.8, "2026-02": 1.8, "2026-05": 1.6, "2026-07": 12.6, "2026-08": 9.2 },
  QALAMPIR: { "2026-01": 18.5, "2026-02": 4.2, "2026-05": -19.7, "2026-07": -39.4, "2026-08": -9.2 },
  KARAM: { "2026-01": 3.8, "2026-02": 1.8, "2026-05": -3.5, "2026-08": -4.9 },
  OLMA: { "2026-02": 4.1, "2026-05": 2.6, "2026-08": -7.2 },
  UZUM: { "2026-08": -10.9 },
  TARVUZ: { "2026-07": -20.3, "2026-08": 7.5 },
};

const META = {
  POMIDOR: { name: "Pomidor", emoji: "🍅" },
  BODRING: { name: "Bodring", emoji: "🥒" },
  KARTOSHKA: { name: "Kartoshka", emoji: "🥔" },
  PIYOZ: { name: "Piyoz", emoji: "🧅" },
  SABZI: { name: "Sabzi", emoji: "🥕" },
  QALAMPIR: { name: "Qalampir", emoji: "🫑" },
  KARAM: { name: "Karam", emoji: "🥬" },
  OLMA: { name: "Olma", emoji: "🍎" },
  UZUM: { name: "Uzum", emoji: "🍇" },
  TARVUZ: { name: "Tarvuz", emoji: "🍉" },
};

function stampMonth(ym) {
  const [year, month] = ym.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, 15) / 1000);
}

function walk(symbol) {
  const start = MONTHS.indexOf("2025-12");
  let price = BASE[symbol];
  const points = [];
  MONTHS.forEach((ym, index) => {
    if (index > start) {
      const pct = MOM[symbol][ym] ?? 0;
      price = Math.round(price * (1 + pct / 100));
    }
    if (index < start) {
      points.push({ time: stampMonth(ym), date: `${ym}-15`, close: BASE[symbol] });
      return;
    }
    points.push({ time: stampMonth(ym), date: `${ym}-15`, close: price });
  });
  return points;
}

export const SERIES = Object.fromEntries(Object.keys(META).map((symbol) => [symbol, walk(symbol)]));

export function quotesFromStat() {
  return Object.entries(META).map(([symbol, meta]) => {
    const series = SERIES[symbol];
    const last = series.at(-1).close;
    const official = Object.entries(MOM[symbol]);
    const lastOfficial = official.at(-1);
    const pct = lastOfficial ? lastOfficial[1] : 0;
    const prev = lastOfficial
      ? Math.round(last / (1 + pct / 100))
      : series.at(-2).close;
    return { symbol, ...meta, last, change: last - prev, pct, series };
  });
}

export { SOURCE, MONTHS };
