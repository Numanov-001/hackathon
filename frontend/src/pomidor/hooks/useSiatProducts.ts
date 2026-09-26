import { useEffect, useState } from "react";
import { applyImages } from "../data/media";
import { PRODUCTS } from "../data/products";
import { loadSiatProducts } from "../data/siat";
import type { Product } from "../types";

export function useSiatProducts() {
  const [base, setBase] = useState<Product[]>(PRODUCTS);
  const [products, setProducts] = useState<Product[]>(() => applyImages(PRODUCTS));
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    loadSiatProducts().then((result) => {
      if (!active) return;
      setBase(result.products);
      setProducts(applyImages(result.products));
      setLive(result.live);
    });
    return () => {
      active = false;
    };
  }, []);

  return { base, products, setProducts, live };
}
