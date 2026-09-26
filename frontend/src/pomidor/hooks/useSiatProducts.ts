import { useState } from "react";
import { applyImages } from "../data/media";
import { PRODUCTS } from "../data/products";
import type { Product } from "../types";

export function useSiatProducts() {
  const [products, setProducts] = useState<Product[]>(() => applyImages(PRODUCTS));
  return { base: PRODUCTS, products, setProducts, live: false };
}
