import type { Product } from "../types";

export type MarketSnapshot = {
  productId: string;
  productName: string;
  price: number;
  change: number;
  unit: string;
  series: { month: string; price: number }[];
  basketChange: number;
  topUpName: string;
  topUpChange: number;
  topDownName: string;
  topDownChange: number;
};

function basketChangeOf(products: Product[]) {
  const kg = products.filter((item) => item.unit === "kg");
  const source = kg.length ? kg : products;
  const last = source.map((item) => item.chartData.at(-1)?.price ?? 0).filter((n) => n > 0);
  const prev = source.map((item) => item.chartData.at(-2)?.price ?? 0).filter((n) => n > 0);
  const lastAvg = last.length ? last.reduce((a, b) => a + b, 0) / last.length : 0;
  const prevAvg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : lastAvg;
  return prevAvg ? Number((((lastAvg - prevAvg) / prevAvg) * 100).toFixed(1)) : 0;
}

export function buildMarketSnapshot(product: Product, products: Product[]): MarketSnapshot {
  const topUp = products.reduce((best, item) => (item.change > best.change ? item : best), products[0]);
  const topDown = products.reduce((best, item) => (item.change < best.change ? item : best), products[0]);
  return {
    productId: product.id,
    productName: product.name,
    price: product.price,
    change: product.change,
    unit: product.unit,
    series: product.chartData.slice(-24).map((point) => ({
      month: point.month || point.date.slice(0, 7),
      price: point.price,
    })),
    basketChange: basketChangeOf(products),
    topUpName: topUp?.name ?? "",
    topUpChange: topUp?.change ?? 0,
    topDownName: topDown?.name ?? "",
    topDownChange: topDown?.change ?? 0,
  };
}
