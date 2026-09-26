export type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "ALL";
export type ChartMetric = "price" | "volume";
export type NavId = "bozor" | "p2p" | "mahsulotlar" | "obuna" | "profil" | "sozlamalar";

export type PlanId = "free" | "starter" | "business";

export type UserProfile = {
  name: string;
  email: string;
  picture: string;
  phone: string;
  region: string;
  alerts: boolean;
  plan: PlanId;
};
export type OrderStatus = "Yangi" | "Tasdiqlangan" | "Yetkazilmoqda" | "Yakunlangan";

export type ProductCategory = "sabzavot" | "truba" | "optom";
export type ProductUnit = "kg" | "m" | "qop";

export type ChartPoint = {
  date: string;
  price: number;
  volume: number;
  month?: string;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  image: string;
  price: number;
  change: number;
  chartData: ChartPoint[];
};

export type Order = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  kg: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  region: string;
  phone: string;
  note: string;
};

export type ForecastHorizon = 3 | 6 | 12;

export type PredictionPoint = {
  date: string;
  price: number;
  low: number;
  high: number;
};

export type PredictionExplanation = {
  direction: string;
  seasonal: string;
  driver: string;
  recommendation: string;
};

export type PredictionData = {
  product: string;
  horizon: number;
  predicted_points: PredictionPoint[];
  trend: "up" | "down" | "flat";
  explanation: PredictionExplanation;
  confidence: string;
  best_action: string;
  disclaimer: string;
};
