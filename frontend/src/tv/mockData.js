import { SERIES, SOURCE, quotesFromStat } from "./statPrices.js";

export const QUOTES = quotesFromStat();
export { SOURCE };

export function quoteBySymbol(symbol) {
  return QUOTES.find((item) => item.symbol === symbol) ?? QUOTES[0];
}

function stamp(date) {
  return Math.floor(date.getTime() / 1000);
}

function dailyFromMonthly(monthly) {
  const bars = [];
  for (let i = 0; i < monthly.length; i += 1) {
    const current = monthly[i];
    const next = monthly[i + 1];
    const start = new Date(current.time * 1000);
    const end = next ? new Date(next.time * 1000) : new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 15));
    const days = Math.max(1, Math.round((end - start) / 86400000));
    for (let day = 0; day < days; day += 1) {
      const u = next ? day / days : 0;
      const close = next
        ? Math.round(current.close + (next.close - current.close) * u)
        : current.close;
      const when = new Date(start);
      when.setUTCDate(start.getUTCDate() + day);
      bars.push({
        time: stamp(when),
        date: when.toISOString().slice(0, 10),
        close,
        volume: Math.max(80, Math.round(40 + Math.abs((next?.close ?? current.close) - current.close) * 2 + (day % 7) * 12)),
      });
    }
  }
  const last = monthly.at(-1);
  if (bars.at(-1)?.close !== last.close) {
    bars.push({ time: last.time, date: last.date, close: last.close, volume: 0 });
  }
  return bars;
}

function aggregate(bars, interval) {
  if (interval === "D") return bars;
  const groups = new Map();
  bars.forEach((bar) => {
    const date = new Date(bar.time * 1000);
    let key;
    if (interval === "W") {
      const monday = new Date(date);
      monday.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      monday.setUTCHours(0, 0, 0, 0);
      key = stamp(monday);
    } else {
      key = stamp(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
    }
    const current = groups.get(key) ?? { time: key, date: bar.date, close: bar.close, volume: 0 };
    current.close = bar.close;
    current.date = bar.date;
    groups.set(key, current);
  });
  return [...groups.values()];
}

export function seriesFor(symbol, interval) {
  const quote = quoteBySymbol(symbol);
  const monthly = SERIES[quote.symbol];
  const daily = dailyFromMonthly(monthly);
  const source = interval === "M"
    ? monthly.map((bar) => ({ ...bar, volume: 0 }))
    : interval === "W"
      ? aggregate(daily, "W")
      : daily;
  const blue = [];
  const purple = [];
  source.forEach((bar, index) => {
    const point = { time: bar.time, value: bar.close };
    if (index <= source.length / 2) blue.push(point);
    if (index >= source.length / 2 - 1) purple.push(point);
  });
  return { bars: source, blue, purple, quote, sourceNote: SOURCE };
}

export function rangeStart(bars, range) {
  const last = bars.at(-1).time;
  const day = 86400;
  if (range === "ALL" || !bars.length) return bars[0]?.time ?? last;
  if (range === "YTD") return Math.floor(Date.UTC(2026, 0, 1) / 1000);
  const windows = { "1D": day, "5D": 5 * day, "1M": 31 * day, "3M": 92 * day, "6M": 183 * day, "1Y": 365 * day, "5Y": 365 * 5 * day };
  return Math.max(bars[0].time, last - (windows[range] ?? 365 * day));
}

export function formatPrice(value) {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(value);
}

export const RANGES = ["1M", "3M", "6M", "YTD", "1Y", "ALL"];
export const REGIONS = ["Toshkent", "Samarqand", "Namangan", "Andijon", "Farg‘ona", "Buxoro"];
