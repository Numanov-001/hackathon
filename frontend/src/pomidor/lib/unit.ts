import type { ProductUnit } from "../types";

export const UNIT_LABEL: Record<ProductUnit, string> = {
  kg: "kg",
  m: "m",
  qop: "qop",
};

export function priceUnit(unit: ProductUnit) {
  return `UZS/${UNIT_LABEL[unit]}`;
}

export function formatPosted(iso: string) {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}
