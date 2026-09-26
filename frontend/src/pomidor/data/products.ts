import type { Product } from "../types";
import { productsFromSiat } from "./siat";

export const PRODUCTS: Product[] = productsFromSiat();

export function productById(list: Product[], id: string) {
  return list.find((item) => item.id === id) ?? list[0];
}

export { REGIONS } from "./siat";
