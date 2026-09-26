import { useEffect, useState } from "react";
import { getJson } from "../../api/client";
import { applyImages } from "../data/media";
import { PRODUCTS } from "../data/products";
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
    getJson("/api/desk/catalog")
      .then((rows) => {
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        setProducts(applyImages(rows.map((row) => asProduct(row as Product))));
        setLive(true);
      })
      .catch(() => {
        if (!cancelled) setLive(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { base: PRODUCTS, products, setProducts, live };
}
