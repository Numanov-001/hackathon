import { useCallback, useEffect, useState } from "react";
import { getJson } from "../../api/client";
import { applyImages, loadImages } from "../data/media";
import { PRODUCTS } from "../data/products";
import { applySiatQuotes, clearSiatPrices, ensureSiatPlaceholders, parseSiat1308Table, type SiatQuote } from "../data/siat1308";
import { loadSiat1308Quotes } from "../data/siatClient";
import { fetchRemoteImages } from "../data/supabaseApi";
import type { Product } from "../types";

function asProduct(row: Product): Product {
  return {
    ...row,
    price: Number(row.price),
    previousPrice: row.previousPrice == null ? undefined : Number(row.previousPrice),
    change: Number(row.change),
    changePercent: row.changePercent == null ? Number(row.change) : Number(row.changePercent),
    month: row.month,
    chartData: (row.chartData ?? []).map((point) => ({
      ...point,
      price: Number(point.price),
      volume: Number(point.volume),
    })),
  };
}

function emptySiatCatalog(list: Product[], images = loadImages()) {
  return applyImages(ensureSiatPlaceholders(clearSiatPrices(list)), images);
}

function quotesFromCatalog(payload: unknown): SiatQuote[] | null {
  if (!payload || typeof payload !== "object") return null;
  const products = (payload as { products?: unknown }).products;
  if (!Array.isArray(products) || products.length < 4) return parseSiat1308Table(payload);
  const quotes = products
    .filter((row) => row && typeof row === "object" && ["pomidor", "kartoshka", "piyoz", "sabzi"].includes(String((row as Product).id)))
    .map((row) => asProduct(row as Product))
    .map((row) => ({
      id: row.id as SiatQuote["id"],
      name: row.name,
      price: row.price,
      previousPrice: row.previousPrice ?? 0,
      changePercent: row.changePercent ?? row.change,
      month: row.month ?? "",
      unit: "so'm/kg" as const,
      chartData: row.chartData,
    }));
  return quotes.length === 4 ? quotes : null;
}

export function useSiatProducts() {
  const [products, setProducts] = useState<Product[]>(() => emptySiatCatalog(PRODUCTS));
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message2020, setMessage2020] = useState("2020-yil uchun rasmiy ma'lumot mavjud emas.");

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      const [desk, remote, stored, client] = await Promise.all([
        getJson("/api/desk/catalog").catch(() => null),
        fetchRemoteImages().catch(() => ({})),
        getJson("/api/market-prices/catalog")
          .then((payload) => ({ ok: true as const, payload }))
          .catch(() => ({ ok: false as const, payload: null })),
        loadSiat1308Quotes()
          .then((quotes) => ({ ok: true as const, quotes }))
          .catch((err: unknown) => ({
            ok: false as const,
            message: err instanceof Error && err.message ? err.message : "Narxlar yuklanmadi.",
          })),
      ]);
      if (cancelled) return;
      const images = { ...loadImages(), ...(remote ?? {}) };
      const fromDesk = Array.isArray(desk) && desk.length > 0;
      const base = fromDesk ? (desk as Product[]).map((row) => asProduct(row)) : PRODUCTS;
      const catalog = emptySiatCatalog(base, images);
      const fromStore = stored.ok ? quotesFromCatalog(stored.payload) : null;
      if (stored.ok && stored.payload && typeof stored.payload === "object" && "message_2020" in stored.payload) {
        const text = (stored.payload as { message_2020?: string }).message_2020;
        if (text) setMessage2020(text);
      }
      const quotes = fromStore ?? (client.ok ? client.quotes : null);
      if (!quotes) {
        setLive(false);
        setError(!client.ok && "message" in client ? client.message : "Narxlar yuklanmadi.");
        setProducts(catalog);
        return;
      }
      setError("");
      setLive(true);
      setProducts(applySiatQuotes(catalog, quotes));
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => reload(), [reload]);

  return { base: PRODUCTS, products, setProducts, live, loading, error, reload, message2020 };
}
