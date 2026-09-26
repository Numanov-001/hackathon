export type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "ALL";
export type ChartMetric = "price" | "volume";
export type NavId = "bozor" | "p2p" | "mahsulotlar" | "obuna" | "profil" | "sozlamalar";

export type PlanId = "free" | "plus" | "pro";

export type UserProfile = {
  name: string;
  role: string;
  phone: string;
  email: string;
  region: string;
  alerts: boolean;
  plan: PlanId;
};
export type OrderStatus = "Yangi" | "Tasdiqlangan" | "Yetkazilmoqda" | "Yakunlangan";

export type ChartPoint = {
  date: string;
  price: number;
  volume: number;
  month?: string;
};

export type Product = {
  id: string;
  name: string;
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
