import { useEffect, useState } from "react";
import { applyImages, loadImages } from "../data/media";
import { PRODUCTS } from "../data/products";
import { fetchRemoteImages } from "../data/supabaseApi";
import type { Product } from "../types";

export function useSiatProducts() {
  const [products, setProducts] = useState<Product[]>(() => applyImages(PRODUCTS));

  useEffect(() => {
    let active = true;
    fetchRemoteImages().then((remote) => {
      if (!active) return;
      setProducts(applyImages(PRODUCTS, { ...loadImages(), ...remote }));
    });
    return () => {
      active = false;
    };
  }, []);

  return { base: PRODUCTS, products, setProducts, live: false };
}
