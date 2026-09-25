const SPLIT = "2026-04-01";
const LAST_CLOSE = 30608.13;
const LAST_CHANGE = 129.28;

const KEYS = [
  [0, 24750],
  [0.08, 23180],
  [0.16, 24840],
  [0.26, 25480],
  [0.34, 24620],
  [0.4, 22840],
  [0.48, 23680],
  [0.56, 26840],
  [0.64, 30480],
  [0.72, 28620],
  [0.78, 27480],
  [0.86, 29640],
  [0.93, 28460],
  [1, LAST_CLOSE],
];

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerpPath(t) {
  for (let i = 1; i < KEYS.length; i += 1) {
    const [t0, p0] = KEYS[i - 1];
    const [t1, p1] = KEYS[i];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0);
      const s = u * u * (3 - 2 * u);
      return p0 + (p1 - p0) * s;
    }
  }
  return LAST_CLOSE;
}

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function stamp(date) {
  return Math.floor(date.getTime() / 1000);
}

export function buildDaily() {
  const rand = mulberry32(20260926);
  const start = new Date(Date.UTC(2025, 10, 3));
  const end = new Date(Date.UTC(2026, 8, 26));
  const span = end - start;
  const bars = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.getUTCDay();
    if (day === 0 || day === 6) continue;
    const t = (cursor - start) / span;
    const wobble = (rand() - 0.5) * 280 + Math.sin(t * 48) * 90;
    const close = Math.round((lerpPath(t) + wobble) * 100) / 100;
    const prev = bars.at(-1)?.close ?? close;
    const move = Math.abs(close - prev);
    const volume = Math.round(720_000_000 + move * 1_800_000 + rand() * 480_000_000);
    bars.push({ time: stamp(new Date(cursor)), date: iso(cursor), close, volume });
  }
  const last = bars.at(-1);
  const prev = bars.at(-2);
  last.close = LAST_CLOSE;
  prev.close = Math.round((LAST_CLOSE - LAST_CHANGE) * 100) / 100;
  last.volume = 1_320_000_000;
  return bars;
}

export function buildIntraday(daily) {
  const rand = mulberry32(42);
  const sessions = daily.slice(-8);
  const bars = [];
  sessions.forEach((session, index) => {
    const open = index === 0 ? session.close * 0.996 : sessions[index - 1].close;
    const steps = 13;
    for (let step = 0; step < steps; step += 1) {
      const u = (step + 1) / steps;
      const drift = open + (session.close - open) * u;
      const noise = (rand() - 0.5) * Math.abs(session.close - open) * 0.35;
      const close = step === steps - 1 ? session.close : Math.round((drift + noise) * 100) / 100;
      const when = new Date(session.time * 1000);
      when.setUTCHours(13, 30 + step * 30, 0, 0);
      bars.push({
        time: stamp(when),
        date: session.date,
        close,
        volume: Math.round(session.volume / steps),
      });
    }
  });
  return bars;
}

const DAILY = buildDaily();
const INTRADAY = buildIntraday(DAILY);

export const QUOTES = [
  { group: "Indices", symbol: "SPX", name: "S&P 500", last: 7743.41, change: 39.78, pct: 0.51, dot: "#f23645" },
  { group: "Indices", symbol: "NDQ", name: "Nasdaq Composite", last: 30608.13, change: 129.78, pct: 0.42, dot: "#2962ff" },
  { group: "Indices", symbol: "RUT", name: "Russell 2000", last: 11834.17, change: 479.03, pct: 4.22, dot: "#9c27b0" },
  { group: "Indices", symbol: "VIX", name: "Volatility Index", last: 14.87, change: -0.8, pct: -5.11, dot: "#089981" },
  { group: "Indices", symbol: "DXY", name: "US Dollar Index", last: 101.034, change: -0.215, pct: -0.21, dot: "#00bcd4" },
  { group: "Stocks", symbol: "AAPL", name: "Apple Inc.", last: 341.07, change: 5.15, pct: 1.53, dot: "#131722" },
  { group: "Stocks", symbol: "TSLA", name: "Tesla Inc.", last: 372.11, change: 5.83, pct: 1.56, dot: "#e53935" },
  { group: "Stocks", symbol: "NFLX", name: "Netflix Inc.", last: 71.15, change: 0.58, pct: 0.83, dot: "#d32f2f" },
  { group: "Futures", symbol: "USOIL", name: "Crude oil", last: 97.45, change: -3.13, pct: -3.11, dot: "#6d4c41" },
  { group: "Futures", symbol: "NDX", name: "Nasdaq 100 Index", exchange: "NASDAQ", last: LAST_CLOSE, change: LAST_CHANGE, pct: 0.42, dot: "#131722" },
];

export function quoteBySymbol(symbol) {
  return QUOTES.find((item) => item.symbol === symbol) ?? QUOTES.at(-1);
}

function scaleBars(bars, quote) {
  const last = bars.at(-1).close;
  const factor = quote.last / last;
  return bars.map((bar, index) => {
    const close = index === bars.length - 1 ? quote.last : Math.round(bar.close * factor * 1000) / 1000;
    return { ...bar, close };
  });
}

function aggregate(bars, interval) {
  if (interval === "D") return bars;
  const groups = new Map();
  bars.forEach((bar) => {
    const date = new Date(bar.time * 1000);
    let key;
    if (interval === "W") {
      const day = date.getUTCDay();
      const monday = new Date(date);
      monday.setUTCDate(date.getUTCDate() - ((day + 6) % 7));
      monday.setUTCHours(0, 0, 0, 0);
      key = stamp(monday);
    } else {
      key = stamp(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
    }
    const current = groups.get(key) ?? { time: key, date: bar.date, close: bar.close, volume: 0 };
    current.close = bar.close;
    current.volume += bar.volume;
    current.date = bar.date;
    groups.set(key, current);
  });
  return [...groups.values()];
}

export function seriesFor(symbol, interval, range) {
  const quote = quoteBySymbol(symbol);
  const useIntraday = interval === "D" && (range === "1D" || range === "5D");
  const source = useIntraday ? scaleBars(INTRADAY, quote) : aggregate(scaleBars(DAILY, quote), interval);
  const split = Math.floor(new Date(`${SPLIT}T00:00:00Z`).getTime() / 1000);
  let previous = null;
  const blue = [];
  const purple = [];
  const volume = [];
  source.forEach((bar) => {
    const point = { time: bar.time, value: bar.close };
    const up = previous == null || bar.close >= previous;
    if (bar.time <= split) blue.push(point);
    if (bar.time >= split) purple.push(point);
    volume.push({ time: bar.time, value: bar.volume, color: up ? "#7dcdc4" : "#f3b3b6" });
    previous = bar.close;
  });
  return { bars: source, blue, purple, volume, quote };
}

export function rangeStart(bars, range) {
  const last = bars.at(-1).time;
  const day = 86400;
  if (range === "ALL" || !bars.length) return bars[0]?.time ?? last;
  if (range === "YTD") {
    const date = new Date(last * 1000);
    return Math.floor(Date.UTC(date.getUTCFullYear(), 0, 1) / 1000);
  }
  const windows = { "1D": day, "5D": 5 * day, "1M": 31 * day, "3M": 92 * day, "6M": 183 * day, "1Y": 365 * day, "5Y": 365 * 5 * day };
  return Math.max(bars[0].time, last - (windows[range] ?? 365 * day));
}

export function formatPrice(value, symbol) {
  const digits = symbol === "DXY" ? 3 : value >= 1000 ? 2 : 2;
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

export function formatCompact(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export const PERFORMANCE = [
  ["1W", "3.65%"],
  ["1M", "5.07%"],
  ["3M", "5.40%"],
  ["6M", "30.45%"],
  ["YTD", "19.97%"],
  ["1Y", "29.85%"],
];

export const RANGES = ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y", "ALL"];
