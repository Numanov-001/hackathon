import type { ChartPoint, Product } from "../types";
import { SIAT_ALIASES, SIAT_MONTHS, SIAT_ROWS, SIAT_SOURCE } from "./siatOfficial";

const IMG: Record<string, string> = {
  pomidor: "https://images.unsplash.com/photo-1546470427-e99c2c387e9e?auto=format&fit=crop&w=240&h=240&q=80",
  bodring: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=240&h=240&q=80",
  kartoshka: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=240&h=240&q=80",
  piyoz: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=240&h=240&q=80",
  sabzi: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=240&h=240&q=80",
  qalampir: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=240&h=240&q=80",
  karam: "https://images.unsplash.com/photo-1594282415386-c438f0c2871c?auto=format&fit=crop&w=240&h=240&q=80",
  olma: "https://images.unsplash.com/photo-1560806887-1e4cd0b21094?auto=format&fit=crop&w=240&h=240&q=80",
  uzum: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=240&h=240&q=80",
  tarvuz: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=240&h=240&q=80",
};

const NAMES: Record<string, string> = {
  pomidor: "Pomidor",
  bodring: "Bodring",
  kartoshka: "Kartoshka",
  piyoz: "Piyoz",
  sabzi: "Sabzi",
  qalampir: "Qalampir",
  karam: "Karam",
  olma: "Olma",
  uzum: "Uzum",
  tarvuz: "Tarvuz",
};

export { SIAT_SOURCE };

function monthToDate(ym: string) {
  return `${ym}-01`;
}

function lastNonZero(values: number[]) {
  return [...values].reverse().find((value) => value > 0) ?? values.at(-1) ?? 0;
}

function previousNonZero(values: number[]) {
  const usable = values.filter((value) => value > 0);
  if (usable.length < 2) return usable[0] ?? 0;
  return usable[usable.length - 2];
}

function toPoints(values: number[], months: string[]): ChartPoint[] {
  return months.map((month, index) => ({
    date: monthToDate(month),
    price: values[index] ?? 0,
    volume: 0,
    month,
  }));
}

function productFromSeries(id: string, values: number[], months: string[]): Product {
  const last = lastNonZero(values);
  const prev = previousNonZero(values);
  const change = prev ? ((last - prev) / prev) * 100 : 0;
  return {
    id,
    name: NAMES[id],
    image: IMG[id],
    price: Math.round(last),
    change: Number(change.toFixed(1)),
    chartData: toPoints(values, months),
  };
}

function decode(html: string) {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

function parseMonths(html: string) {
  const found = [...html.matchAll(/20\d{2}-M?(\d{2})/gi)].map((match) => {
    const year = match[0].slice(0, 4);
    const month = match[1];
    return `${year}-${month}`;
  });
  return [...new Set(found)];
}

function parseRow(html: string, aliases: string[]) {
  const text = decode(html);
  for (const alias of aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`${escaped}[\\s\\S]{0,40}((?:[\\d.,]+[\\s|,</td>]+){8,})`, "i"));
    if (!match) continue;
    const values = [...match[1].matchAll(/\d+(?:[.,]\d+)?/g)].map((item) => Number(item[0].replace(",", ".")));
    if (values.length >= 12) return values;
  }
  return null;
}

function fromTable(html: string) {
  const months = parseMonths(html);
  if (months.length < 12) return null;
  const latest = months.slice(-12);
  const rows: Record<string, number[]> = {};
  for (const [id, aliases] of Object.entries(SIAT_ALIASES)) {
    const values = parseRow(html, aliases);
    if (!values || values.length < 12) return null;
    rows[id] = values.slice(-12);
  }
  return { months: latest, rows };
}

export function productsFromSiat(months = [...SIAT_MONTHS], rows = SIAT_ROWS) {
  return Object.keys(NAMES).map((id) => productFromSeries(id, rows[id], months));
}

export async function loadSiatProducts(): Promise<{ products: Product[]; live: boolean }> {
  const fallback = { products: productsFromSiat(), live: false };
  const endpoints = ["/siat/data/1329/", "https://siat.stat.uz/data/1329/"];
  for (const url of endpoints) {
    try {
      const response = await fetch(url, { headers: { Accept: "text/html,application/json" } });
      if (!response.ok) continue;
      const type = response.headers.get("content-type") ?? "";
      const body = await response.text();
      if (type.includes("json")) {
        continue;
      }
      const parsed = fromTable(body);
      if (parsed) return { products: productsFromSiat(parsed.months, parsed.rows), live: true };
    } catch {
      /* try next */
    }
  }
  return fallback;
}

export const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg‘ona",
  "Jizzax",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog‘iston",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
  "Xorazm",
];
