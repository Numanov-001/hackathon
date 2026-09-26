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
  phone: string;
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
  ["Agro Fresh", "+998909100001", true, 99.1, 428],
  ["Samarqand Dehqon", "+998909100002", true, 98.4, 312],
  ["Toshkent Opt", "+998909100003", true, 98.9, 640],
  ["Farg‘ona Plus", "+998909100004", true, 99.4, 510],
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
      const available = product.unit === "m"
        ? 200 + ((pIndex * 30 + sIndex * 18) % 600)
        : product.unit === "qop"
          ? 40 + ((pIndex * 8 + sIndex * 6) % 80)
          : (2 + ((pIndex * 3 + sIndex * 2) % 14)) * 1000;
      offers.push({
        id: `${product.id}-${sIndex}`,
        side,
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        seller: seller[0],
        phone: seller[1],
        verified: seller[2],
        rating: seller[3],
        trades: seller[4],
        price: Math.round(product.price * shift),
        available,
        minQty: product.unit === "kg" ? 1000 : product.unit === "m" ? 20 : 10,
        maxQty: available,
        payment: PAYMENTS[(pIndex + sIndex) % PAYMENTS.length],
        region: REGIONS[(pIndex + sIndex) % REGIONS.length],
        postedAt: postedDate(pIndex * 8 + sIndex),
      });
    });
  });
  return offers.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export { REGIONS };
