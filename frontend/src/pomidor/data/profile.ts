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
    name: "FREE",
    price: "0",
    period: "so‘m",
    points: [
      "Joriy narxlar",
      "Asosiy grafiklar",
      "Asosiy P2P",
    ],
  },
  {
    id: "starter",
    name: "PRO",
    price: "199 000",
    period: "so‘m/oy",
    points: [
      "Birinchi oy bepul",
      "Prognoz",
      "Ilg‘or tahlil",
      "Narx alertlari",
      "Foyda kalkulyatori",
      "P2P telefon va e’lon",
    ],
  },
  {
    id: "business",
    name: "BUSINESS",
    price: "299 000",
    period: "so‘m/oy",
    points: [
      "PRO dagi hammasi",
      "API (keyin ulanadi)",
      "Jamoa",
      "Ustuvor yordam",
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
