import type { PlanId, UserProfile } from "../types";

export const PLANS: Array<{ id: PlanId; name: string; price: string; points: string[] }> = [
  { id: "free", name: "Bepul", price: "0 UZS", points: ["Joriy narxlar", "P2P e’lonlarni ko‘rish"] },
  { id: "plus", name: "Plus", price: "29 000 UZS/oy", points: ["Viloyat bo‘yicha haftalik hisobot", "10% narx ogohlantirishi"] },
  { id: "pro", name: "Pro", price: "79 000 UZS/oy", points: ["Plus imkoniyatlari", "P2P e’lon bildirishnomalari", "Ustuvor listing"] },
];

const KEY = "pomidor-profile";

export const DEFAULT_PROFILE: UserProfile = {
  name: "Azizbek Xandirov",
  role: "Fermer / Xaridor",
  phone: "+998 90 123 45 67",
  email: "azizbek@example.com",
  region: "Toshkent viloyati",
  alerts: true,
  plan: "free",
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}
