import { Bell, Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import { REGIONS } from "./data/products";
import { PLANS } from "./data/profile";
import Select from "./Select";
import { cn } from "./lib/cn";
import type { PlanId, UserProfile } from "./types";

type AccountPageProps = {
  mode: "profil" | "sozlamalar";
  profile: UserProfile;
  onChange: (next: UserProfile) => void;
  onSave: () => void;
};

const field = "h-12 rounded-[10px] border border-[#E4E7EC] px-3 text-sm outline-none focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12";

export default function AccountPage({ mode, profile, onChange, onSave }: AccountPageProps) {
  const title = mode === "profil" ? "Profil" : "Obuna";
  return (
    <section className="col-span-12 mx-auto w-full max-w-3xl rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <h2 className="text-xl font-semibold text-[#14213D]">{title}</h2>
      <p className="mt-1 text-sm text-[#667085]">
        {mode === "profil"
          ? "Ism, telefon, email va viloyat hisobingizga saqlanadi."
          : "Obuna, ogohlantirish va hisob sozlamalari."}
      </p>
      {mode === "profil" ? (
        <div className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            <span className="inline-flex items-center gap-1.5"><UserRound size={14} strokeWidth={1.8} /> To‘liq ism</span>
            <input value={profile.name} onChange={(event) => onChange({ ...profile, name: event.target.value })} className={field} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            Rol
            <input value={profile.role} onChange={(event) => onChange({ ...profile, role: event.target.value })} className={field} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            <span className="inline-flex items-center gap-1.5"><Phone size={14} strokeWidth={1.8} /> Telefon</span>
            <input value={profile.phone} onChange={(event) => onChange({ ...profile, phone: event.target.value })} className={field} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            <span className="inline-flex items-center gap-1.5"><Mail size={14} strokeWidth={1.8} /> Email</span>
            <input
              type="email"
              value={profile.email}
              onChange={(event) => onChange({ ...profile, email: event.target.value })}
              placeholder="hisob@email.uz"
              className={field}
            />
          </label>
          <div className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} strokeWidth={1.8} /> Viloyat</span>
            <Select
              aria-label="Viloyat"
              searchable
              value={profile.region}
              onChange={(region) => onChange({ ...profile, region })}
              options={REGIONS.map((item) => ({ value: item, label: item }))}
            />
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#14213D]">Obuna</h3>
            <p className="mt-1 text-sm text-[#667085]">Haftalik hisobot {profile.email || "emailingiz"} va {profile.region} bo‘yicha yuboriladi.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {PLANS.map((plan) => {
                const active = profile.plan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => onChange({ ...profile, plan: plan.id as PlanId, alerts: plan.id === "free" ? profile.alerts : true })}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all duration-150",
                      active ? "border-[#16A05D] bg-[#F5FBF7] ring-[3px] ring-[#16A05D]/12" : "border-[#E4E7EC] hover:border-[#16A05D]/40",
                    )}
                  >
                    <p className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{plan.name}</span>
                      {active && <span className="rounded-full bg-[#EAF8F0] px-2 py-0.5 text-[11px] font-semibold text-[#087A45]">Tanlangan</span>}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#16A05D]">{plan.price}</p>
                    <ul className="mt-3 grid gap-1.5 text-xs text-[#667085]">
                      {plan.points.map((point) => <li key={point}>• {point}</li>)}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-start gap-3 rounded-2xl bg-[#F5FBF7] p-4">
            <input
              type="checkbox"
              checked={profile.alerts}
              onChange={(event) => onChange({ ...profile, alerts: event.target.checked })}
              className="mt-1 h-4 w-4 accent-[#16A05D]"
            />
            <span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#14213D]">
                <Bell size={14} strokeWidth={1.8} />
                Narx ogohlantirishi
              </span>
              <span className="mt-1 block text-sm text-[#667085]">
                Mahsulot 10% dan ko‘p o‘zgarsa, bildirishnomada ko‘rinadi.
              </span>
            </span>
          </label>
        </div>
      )}
      <button
        type="button"
        onClick={onSave}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#16A05D] px-5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#087A45]"
      >
        <Save size={16} strokeWidth={1.8} />
        {mode === "sozlamalar" && profile.plan !== "free" ? "Obunani saqlash" : "Saqlash"}
      </button>
    </section>
  );
}
