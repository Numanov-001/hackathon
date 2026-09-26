import type { PlanId, UserProfile } from "../types";
import { REGIONS } from "./siat";

export const PLANS: Array<{ id: PlanId; name: string; price: string; points: string[] }> = [
  { id: "free", name: "Bepul", price: "0 UZS", points: ["Joriy narxlar", "P2P e’lonlarni ko‘rish"] },
  { id: "plus", name: "Plus", price: "29 000 UZS/oy", points: ["Viloyat bo‘yicha haftalik hisobot", "10% narx ogohlantirishi"] },
  { id: "pro", name: "Pro", price: "79 000 UZS/oy", points: ["Plus imkoniyatlari", "P2P e’lon bildirishnomalari", "Ustuvor listing"] },
];

const PREFS_KEY = "pomidor-prefs";

export type AccountPrefs = Pick<UserProfile, "phone" | "region" | "alerts" | "plan">;

export const DEFAULT_PREFS: AccountPrefs = {
  phone: "",
  region: REGIONS[0],
  alerts: true,
  plan: "free",
};

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
      plan: parsed.plan === "plus" || parsed.plan === "pro" ? parsed.plan : "free",
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: AccountPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
