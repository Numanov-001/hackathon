import type { PlanId, UserProfile } from "../types";
import { REGIONS } from "./siat";

export const FREE_PLAN = {
  id: "free" as const,
  name: "Bepul",
  price: "0 UZS",
  points: ["Joriy narxlar", "P2P e’lonlarni ko‘rish"],
};

const PREFS_KEY = "pomidor-prefs";

export type AccountPrefs = Pick<UserProfile, "phone" | "region" | "alerts" | "plan">;

export const DEFAULT_PREFS: AccountPrefs = {
  phone: "",
  region: REGIONS[0],
  alerts: true,
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
