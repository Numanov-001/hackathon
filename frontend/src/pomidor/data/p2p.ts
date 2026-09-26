import { PRODUCTS } from "./products";
import { REGIONS } from "./siat";
import type { Product, ProductUnit } from "../types";

export const PAYMENTS = ["Naqd", "Uzcard", "Humo", "Click", "Payme"] as const;

export type P2PSide = "buy" | "sell";

export type P2POffer = {
  id: string;
  side: P2PSide;
  productId: string;
  productName: string;
  unit: ProductUnit;
  seller: string;
  verified: boolean;
  rating: number;
  trades: number;
  price: number;
  available: number;
  minQty: number;
  maxQty: number;
  payment: (typeof PAYMENTS)[number];
  region: string;
  postedAt: string;
};

const SELLERS = [
  ["Agro Fresh", true, 99.1, 428],
  ["Samarqand Dehqon", true, 98.4, 312],
  ["Toshkent Opt", true, 98.9, 640],
  ["Farg‘ona Plus", true, 99.4, 510],
  ["Metall Savdo", true, 97.2, 186],
  ["Plast Line", false, 95.8, 94],
  ["Qurilish Opt", true, 98.1, 271],
  ["Un Yog‘ Hub", false, 96.4, 133],
] as const;

function postedDate(index: number) {
  const day = new Date(2026, 8, 26);
  day.setDate(day.getDate() - ((index * 5) % 48));
  return day.toISOString();
}

export function buildOffers(products: Product[]): P2POffer[] {
  const list = products.length ? products : PRODUCTS;
  const offers: P2POffer[] = [];
  list.forEach((product, pIndex) => {
    SELLERS.forEach((seller, sIndex) => {
      if (sIndex > 3) return;
      const side: P2PSide = sIndex % 2 === 0 ? "sell" : "buy";
      const shift = 1 + (((pIndex * 7 + sIndex * 3) % 9) - 4) / 100;
      const lot = product.unit === "m" ? 40 : product.unit === "qop" ? 20 : 80;
      const available = lot + ((pIndex * 30 + sIndex * 18) % (lot * 4));
      offers.push({
        id: `${product.id}-${sIndex}`,
        side,
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        seller: seller[0],
        verified: seller[1],
        rating: seller[2],
        trades: seller[3],
        price: Math.round(product.price * shift),
        available,
        minQty: product.unit === "m" ? 20 : 10,
        maxQty: Math.min(available, lot + sIndex * 10),
        payment: PAYMENTS[(pIndex + sIndex) % PAYMENTS.length],
        region: REGIONS[(pIndex + sIndex) % REGIONS.length],
        postedAt: postedDate(pIndex * 8 + sIndex),
      });
    });
  });
  return offers.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export { REGIONS };
