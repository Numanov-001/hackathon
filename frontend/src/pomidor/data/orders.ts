import type { Order } from "../types";
import { PRODUCTS, productById } from "./products";

function seed(id: string, productId: string, kg: number, status: Order["status"], createdAt: string): Order {
  const product = productById(PRODUCTS, productId);
  return {
    id,
    productId,
    productName: product.name,
    productImage: product.image,
    kg,
    total: product.price * kg,
    status,
    createdAt,
    region: "Toshkent viloyati",
    phone: "+998 90 123 45 67",
    note: "",
  };
}

export const SEED_ORDERS: Order[] = [
  seed("#ZK-0012", "pomidor", 20, "Yangi", "2026-08-31T10:24:00"),
  seed("#ZK-0011", "bodring", 15, "Tasdiqlangan", "2026-08-30T16:12:00"),
  seed("#ZK-0010", "kartoshka", 50, "Yetkazilmoqda", "2026-08-29T09:37:00"),
  seed("#ZK-0009", "piyoz", 30, "Yakunlangan", "2026-08-27T14:08:00"),
];
