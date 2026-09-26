import { formatPrice } from "./format";
import type { ProductUnit } from "../types";

export const UNIT_LABEL: Record<ProductUnit, string> = {
  kg: "kg",
  m: "m",
  qop: "qop",
};

export function priceUnit(unit: ProductUnit) {
  return `UZS/${UNIT_LABEL[unit]}`;
}

export function formatLot(amount: number, unit: ProductUnit) {
  if (unit === "kg") {
    const tons = amount / 1000;
    const primary = Number.isInteger(tons)
      ? `${tons} t`
      : `${(tons >= 1 ? tons.toFixed(1) : tons.toFixed(2)).replace(/0+$/, "").replace(/\.$/, "")} t`;
    return { primary, secondary: `${formatPrice(amount)} kg` };
  }
  if (unit === "m") return { primary: `${formatPrice(amount)} m`, secondary: "metr" };
  return { primary: `${formatPrice(amount)} qop`, secondary: "qop" };
}

export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("998") ? digits.slice(3) : digits;
  if (local.length !== 9) return raw;
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}

export function phoneHref(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const full = digits.startsWith("998") ? digits : `998${digits}`;
  return `tel:+${full}`;
}

export function formatPosted(iso: string) {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}
