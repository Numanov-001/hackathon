import type { PlanId, UserProfile } from "../types";
import { REGIONS } from "./siat";

export const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  points: string[];
}[] = [
  {
    id: "free",
    name: "Bepul",
    price: "0",
    period: "so‘m",
    points: [
      "Joriy narxlar va grafik",
      "P2P: ism, narx, miqdor, hudud",
      "Telefon yopiq",
      "E’lon qo‘yib bo‘lmaydi",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "199 000",
    period: "so‘m/oy",
    points: [
      "Bepul tarifdagi hammasi",
      "Sotuvchi va xaridor telefoni",
      "O‘z e’loningizni qo‘yish",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "299 000",
    period: "so‘m/oy",
    points: [
      "Starterdagi hammasi",
      "Eng arzon taklif tavsiyasi",
    ],
  },
];

export const CUSTOM_PLAN = {
  name: "Custom",
  price: "Kelishuv",
  points: ["API", "Bir nechta foydalanuvchi", "Integratsiya", "Alohida yordam"],
};

const PREFS_KEY = "pomidor-prefs";

export type AccountPrefs = Pick<UserProfile, "phone" | "region" | "alerts" | "plan">;

export const DEFAULT_PREFS: AccountPrefs = {
  phone: "",
  region: REGIONS[0],
  alerts: false,
  plan: "free",
};

function asPlan(_value: unknown): PlanId {
  return "free";
}

export function loadPrefs(): AccountPrefs {
  try {
    localStorage.removeItem("pomidor-session");
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<AccountPrefs>;
    return {
      phone: String(parsed.phone ?? ""),
      region: String(parsed.region || DEFAULT_PREFS.region),
      alerts: Boolean(parsed.alerts),
      plan: asPlan(parsed.plan),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: AccountPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, plan: "free" as const }));
}
