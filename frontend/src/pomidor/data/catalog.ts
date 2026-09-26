import type { ChartPoint, Product, ProductCategory, ProductUnit } from "../types";

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  sabzavot: "Sabzavot",
  truba: "Truba",
  optom: "Optom",
};

export const MOCK_SOURCE = {
  label: "Demo qator · 24 oy oylik o‘rtacha",
  note: "Mock narxlar, jonli birja emas. 2024-okt — 2026-sen.",
};

export function productPhoto(id: string) {
  return `/products/${id}.jpg?v=2`;
}

type Spec = {
  id: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  base: number;
  seasonal: number;
  phase: number;
  trend: number;
  volume: number;
};

const SPECS: Spec[] = [
  {
    id: "pomidor",
    name: "Pomidor",
    category: "sabzavot",
    unit: "kg",
    base: 9200,
    seasonal: 2200,
    phase: 1.2,
    trend: 0.04,
    volume: 18000,
  },
  {
    id: "kartoshka",
    name: "Kartoshka",
    category: "sabzavot",
    unit: "kg",
    base: 5600,
    seasonal: 700,
    phase: 0.4,
    trend: 0.03,
    volume: 24000,
  },
  {
    id: "piyoz",
    name: "Piyoz",
    category: "sabzavot",
    unit: "kg",
    base: 3100,
    seasonal: 900,
    phase: 2.1,
    trend: 0.05,
    volume: 16000,
  },
  {
    id: "bodring",
    name: "Bodring",
    category: "sabzavot",
    unit: "kg",
    base: 7400,
    seasonal: 1600,
    phase: 3.4,
    trend: 0.02,
    volume: 12000,
  },
  {
    id: "pe-truba",
    name: "PE suv trubasi",
    category: "truba",
    unit: "m",
    base: 18500,
    seasonal: 800,
    phase: 0.2,
    trend: 0.08,
    volume: 4200,
  },
  {
    id: "metall-truba",
    name: "Metall truba",
    category: "truba",
    unit: "m",
    base: 44800,
    seasonal: 1800,
    phase: 5.0,
    trend: 0.11,
    volume: 2800,
  },
  {
    id: "pvc-truba",
    name: "PVC kanalizatsiya",
    category: "truba",
    unit: "m",
    base: 12600,
    seasonal: 600,
    phase: 1.8,
    trend: 0.06,
    volume: 3600,
  },
  {
    id: "un",
    name: "Bug‘doy uni",
    category: "optom",
    unit: "qop",
    base: 412000,
    seasonal: 18000,
    phase: 4.2,
    trend: 0.07,
    volume: 4200,
  },
  {
    id: "yog",
    name: "Kungaboqar yog‘i",
    category: "optom",
    unit: "kg",
    base: 16800,
    seasonal: 1200,
    phase: 2.6,
    trend: 0.09,
    volume: 9000,
  },
  {
    id: "guruch",
    name: "Guruch",
    category: "optom",
    unit: "kg",
    base: 14500,
    seasonal: 900,
    phase: 3.1,
    trend: 0.05,
    volume: 14000,
  },
];

function monthList(start: string, count: number) {
  const [year, month] = start.split("-").map(Number);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month - 1 + index, 1);
    const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return ym;
  });
}

function hash(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function series(spec: Spec, months: string[]): ChartPoint[] {
  return months.map((month, index) => {
    const t = index / Math.max(months.length - 1, 1);
    const wave = Math.sin((index / 12) * Math.PI * 2 + spec.phase) * spec.seasonal;
    const drift = spec.base * spec.trend * t;
    const noise = ((hash(`${spec.id}-${month}`) % 9) - 4) * (spec.base * 0.003);
    const price = Math.max(400, Math.round(spec.base + drift + wave + noise));
    const volume = Math.round(spec.volume * (0.82 + ((hash(`${month}-${spec.id}`) % 21) / 50)));
    return { date: `${month}-01`, price, volume, month };
  });
}

export const CHART_MONTHS = monthList("2024-10", 24);

export function buildCatalog(): Product[] {
  return SPECS.map((spec) => {
    const chartData = series(spec, CHART_MONTHS);
    const last = chartData.at(-1)?.price ?? spec.base;
    const prev = chartData.at(-2)?.price ?? last;
    const change = prev ? Number((((last - prev) / prev) * 100).toFixed(1)) : 0;
    return {
      id: spec.id,
      name: spec.name,
      category: spec.category,
      unit: spec.unit,
      image: productPhoto(spec.id),
      price: last,
      change,
      chartData,
    };
  });
}

export function yearlyVolume(product: Product) {
  return product.chartData.slice(-12).reduce((sum, point) => sum + point.volume, 0);
}
