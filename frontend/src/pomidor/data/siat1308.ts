import { productPhoto } from "./catalog";
import type { ChartPoint, Product } from "../types";

export const SIAT_DATASET = "1308" as const;
export const SIAT_TABLE_URL = "https://siat.stat.uz/api/sdmx/1308/table/";
export const SIAT_CACHE_MS = 30 * 60 * 1000;
export const SIAT_UNIT = "so'm/kg";

export const SIAT_CROP_IDS = ["pomidor", "kartoshka", "piyoz", "sabzi"] as const;
export type SiatCropId = (typeof SIAT_CROP_IDS)[number];

export type SiatQuote = {
  id: SiatCropId;
  name: string;
  price: number;
  previousPrice: number;
  changePercent: number;
  month: string;
  unit: typeof SIAT_UNIT;
  chartData: ChartPoint[];
};

type SiatNameFields = {
  name?: unknown;
  name_uz?: unknown;
  name_ru?: unknown;
  name_en?: unknown;
  name_uzc?: unknown;
};

type SiatRow = SiatNameFields & {
  data?: unknown;
};

const CROPS: Record<SiatCropId, { name: string; aliases: string[] }> = {
  pomidor: {
    name: "Pomidor",
    aliases: ["pomidor", "помидор", "помидоры", "tomato", "tomatoes"],
  },
  kartoshka: {
    name: "Kartoshka",
    aliases: ["kartoshka", "картофель", "potato", "potatoes"],
  },
  piyoz: {
    name: "Piyoz",
    aliases: ["piyoz", "лук", "onion", "onions"],
  },
  sabzi: {
    name: "Sabzi",
    aliases: ["sabzi", "морковь", "carrot", "carrots"],
  },
};

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeName(value: string) {
  return value
    .toLocaleLowerCase("ru-RU")
    .replace(/[ʼ'`‘’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function namesOf(row: SiatNameFields) {
  return [row.name, row.name_uz, row.name_ru, row.name_en, row.name_uzc]
    .map((value) => normalizeName(asText(value)))
    .filter(Boolean);
}

function matchesCrop(row: SiatNameFields, aliases: string[]) {
  const names = namesOf(row);
  return aliases.some((alias) => {
    const needle = normalizeName(alias);
    return names.some((name) => name === needle || name.includes(needle) || needle.includes(name));
  });
}

function isPeriodKey(key: string) {
  return /^\d{4}-M?\d{2}$/i.test(key);
}

function periodToDate(period: string) {
  const match = period.match(/^(\d{4})-M?(\d{2})$/i);
  if (!match) return `${period}-01`;
  return `${match[1]}-${match[2]}-01`;
}

function periodRank(period: string) {
  const match = period.match(/^(\d{4})-M?(\d{2})$/i);
  if (!match) return 0;
  return Number(match[1]) * 100 + Number(match[2]);
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function observations(data: unknown): Array<{ month: string; price: number }> {
  if (!Array.isArray(data)) return [];
  const points: Array<{ month: string; price: number }> = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    for (const [key, raw] of Object.entries(item as Record<string, unknown>)) {
      if (!isPeriodKey(key)) continue;
      const price = asNumber(raw);
      if (price == null || price <= 0) continue;
      points.push({ month: key.toUpperCase().replace(/^(\d{4})-(\d{2})$/, "$1-M$2"), price });
    }
  }
  points.sort((a, b) => periodRank(a.month) - periodRank(b.month));
  return points;
}

export function parseSiat1308Table(payload: unknown): SiatQuote[] {
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : [];
  const quotes: SiatQuote[] = [];
  for (const id of SIAT_CROP_IDS) {
    const crop = CROPS[id];
    const row = rows.find((item): item is SiatRow => Boolean(item && typeof item === "object" && matchesCrop(item as SiatNameFields, crop.aliases)));
    if (!row) continue;
    const series = observations(row.data);
    if (series.length < 2) continue;
    const current = series[series.length - 1];
    const previous = series[series.length - 2];
    const changePercent = previous.price
      ? Number((((current.price - previous.price) / previous.price) * 100).toFixed(2))
      : 0;
    quotes.push({
      id,
      name: crop.name,
      price: current.price,
      previousPrice: previous.price,
      changePercent,
      month: current.month,
      unit: SIAT_UNIT,
      chartData: series.map((point) => ({
        date: periodToDate(point.month),
        price: point.price,
        volume: 0,
        month: point.month,
      })),
    });
  }
  return quotes;
}

export function isSiatCropId(id: string): id is SiatCropId {
  return (SIAT_CROP_IDS as readonly string[]).includes(id);
}

export function quoteToProduct(quote: SiatQuote, base?: Product): Product {
  return {
    id: quote.id,
    name: quote.name,
    category: base?.category ?? "sabzavot",
    unit: base?.unit ?? "kg",
    image: base?.image ?? productPhoto(quote.id),
    price: quote.price,
    previousPrice: quote.previousPrice,
    change: quote.changePercent,
    changePercent: quote.changePercent,
    month: quote.month,
    chartData: quote.chartData,
  };
}

export function applySiatQuotes(products: Product[], quotes: SiatQuote[]): Product[] {
  const byId = new Map(quotes.map((quote) => [quote.id, quote]));
  const merged = products.map((product) => {
    const quote = byId.get(product.id as SiatCropId);
    return quote ? quoteToProduct(quote, product) : product;
  });
  for (const quote of quotes) {
    if (!merged.some((product) => product.id === quote.id)) {
      const after = merged.findIndex((product) => product.id === "piyoz");
      const next = quoteToProduct(quote);
      if (after >= 0) merged.splice(after + 1, 0, next);
      else merged.unshift(next);
    }
  }
  return merged;
}

export function clearSiatPrices(products: Product[]): Product[] {
  return products.map((product) =>
    isSiatCropId(product.id)
      ? { ...product, price: 0, previousPrice: 0, change: 0, changePercent: 0, month: "", chartData: [] }
      : product,
  );
}

export function ensureSiatPlaceholders(products: Product[]): Product[] {
  const next = [...products];
  for (const id of SIAT_CROP_IDS) {
    if (next.some((product) => product.id === id)) continue;
    const after = next.findIndex((product) => product.id === "piyoz");
    const placeholder: Product = {
      id,
      name: CROPS[id].name,
      category: "sabzavot",
      unit: "kg",
      image: productPhoto(id),
      price: 0,
      previousPrice: 0,
      change: 0,
      changePercent: 0,
      month: "",
      chartData: [],
    };
    if (after >= 0) next.splice(after + 1, 0, placeholder);
    else next.unshift(placeholder);
  }
  return next;
}
