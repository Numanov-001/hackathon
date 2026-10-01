import { getJson } from "../../api/client";
import {
  SIAT_CACHE_MS,
  SIAT_TABLE_URL,
  parseSiat1308Table,
  type SiatQuote,
} from "./siat1308";

const MEMORY_KEY = "siat-1308-quotes";

type CacheEntry = { at: number; quotes: SiatQuote[] };

let memory: CacheEntry | null = null;

function readSession(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(MEMORY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || !Array.isArray(parsed.quotes) || typeof parsed.at !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(entry: CacheEntry) {
  try {
    sessionStorage.setItem(MEMORY_KEY, JSON.stringify(entry));
  } catch {
    /* ignore quota */
  }
}

function fresh(entry: CacheEntry | null) {
  return Boolean(entry && Date.now() - entry.at < SIAT_CACHE_MS && entry.quotes.length === 4);
}

async function fetchPayload() {
  const paths = ["/api/siat/1308", "/api/siat", "/siat/api/sdmx/1308/table/"];
  let lastError: Error | null = null;
  for (const path of paths) {
    try {
      if (path.startsWith("/api/")) {
        return await getJson(path);
      }
      const response = await fetch(path, { headers: { Accept: "application/json" } });
      if (!response.ok) {
        lastError = new Error("SIAT javob bermadi.");
        continue;
      }
      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("SIAT ulanmadi.");
    }
  }
  try {
    const response = await fetch(SIAT_TABLE_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("SIAT javob bermadi.");
    return await response.json();
  } catch (error) {
    throw lastError ?? (error instanceof Error ? error : new Error("SIAT ulanmadi."));
  }
}

export async function loadSiat1308Quotes(): Promise<SiatQuote[]> {
  if (fresh(memory)) return memory!.quotes;
  const stored = readSession();
  if (fresh(stored)) {
    memory = stored;
    return stored!.quotes;
  }
  const payload = await fetchPayload();
  const quotes = parseSiat1308Table(payload);
  if (quotes.length !== 4) {
    throw new Error("SIAT 1308 da to‘rt mahsulot topilmadi.");
  }
  memory = { at: Date.now(), quotes };
  writeSession(memory);
  return quotes;
}
