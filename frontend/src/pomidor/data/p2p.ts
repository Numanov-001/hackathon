import { PRODUCTS } from "./products";
import { REGIONS } from "./siat";
import type { Product } from "../types";

export const PAYMENTS = ["Naqd", "Uzcard", "Humo", "Click", "Payme"] as const;

export type P2PSide = "buy" | "sell";

export type P2POffer = {
  id: string;
  side: P2PSide;
  productId: string;
  productName: string;
  seller: string;
  verified: boolean;
  rating: number;
  trades: number;
  price: number;
  available: number;
  minKg: number;
  maxKg: number;
  payment: (typeof PAYMENTS)[number];
  region: string;
};

const SELLERS = [
  ["Agro Fresh", true, 99.1, 428],
  ["Samarqand Dehqon", true, 98.4, 312],
  ["Namangan Green", false, 96.8, 154],
  ["Buxoro Savdo", true, 97.6, 201],
  ["Andijon Bozor", false, 95.2, 88],
  ["Farg‘ona Plus", true, 99.4, 510],
  ["Toshkent Opt", true, 98.9, 640],
  ["Xorazm Farm", false, 94.7, 67],
] as const;

export function buildOffers(products: Product[]): P2POffer[] {
  const list = products.length ? products : PRODUCTS;
  const offers: P2POffer[] = [];
  list.forEach((product, pIndex) => {
    SELLERS.forEach((seller, sIndex) => {
      if ((pIndex + sIndex) % 3 === 0) return;
      const side: P2PSide = (pIndex + sIndex) % 2 === 0 ? "buy" : "sell";
      const shift = 1 + (((pIndex * 7 + sIndex * 3) % 9) - 4) / 100;
      const price = Math.round(product.price * shift);
      const available = 80 + ((pIndex * 40 + sIndex * 25) % 420);
      offers.push({
        id: `${product.id}-${sIndex}`,
        side,
        productId: product.id,
        productName: product.name,
        seller: seller[0],
        verified: seller[1],
        rating: seller[2],
        trades: seller[3],
        price,
        available,
        minKg: 10,
        maxKg: Math.min(available, 80 + sIndex * 15),
        payment: PAYMENTS[(pIndex + sIndex) % PAYMENTS.length],
        region: REGIONS[(pIndex + sIndex) % REGIONS.length],
      });
    });
  });
  return offers;
}

export { REGIONS };
