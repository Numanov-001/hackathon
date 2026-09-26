import type { Product } from "../types";
import { buildCatalog } from "./catalog";

export const PRODUCTS: Product[] = buildCatalog();

export function productById(list: Product[], id: string) {
  return list.find((item) => item.id === id) ?? list[0];
}

export { REGIONS } from "./siat";
