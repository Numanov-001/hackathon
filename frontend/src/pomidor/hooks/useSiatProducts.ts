import { useEffect, useState } from "react";
import { getJson } from "../../api/client";
import { applyImages, loadImages } from "../data/media";
import { PRODUCTS } from "../data/products";
import { fetchRemoteImages } from "../data/supabaseApi";
import type { Product } from "../types";

function asProduct(row: Product): Product {
  return {
    ...row,
    price: Number(row.price),
    change: Number(row.change),
    chartData: (row.chartData ?? []).map((point) => ({
      ...point,
      price: Number(point.price),
      volume: Number(point.volume),
    })),
  };
}

export function useSiatProducts() {
  const [products, setProducts] = useState<Product[]>(() => applyImages(PRODUCTS));
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getJson("/api/desk/catalog").catch(() => null),
      fetchRemoteImages(),
    ]).then(([rows, remote]) => {
      if (cancelled) return;
      const images = { ...loadImages(), ...(remote ?? {}) };
      const fromDesk = Array.isArray(rows) && rows.length > 0;
      const base = fromDesk ? (rows as Product[]).map((row) => asProduct(row)) : PRODUCTS;
      setProducts(applyImages(base, images));
      setLive(fromDesk);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { base: PRODUCTS, products, setProducts, live };
}
