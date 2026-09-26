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

const field = "h-12 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-accent";

export default function AccountPage({ mode, profile, onChange, onSave }: AccountPageProps) {
  const title = mode === "profil" ? "Profil" : "Obuna";
  return (
    <section className="mx-auto w-full max-w-3xl rounded-[10px] border border-line bg-surface p-6">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">
        {mode === "profil"
          ? "Ism va email Clerk hisobidan. Rol yo‘q."
          : "Obuna va narx ogohlantirishi. Rol tanlash yo‘q."}
      </p>
      {mode === "profil" ? (
        <div className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            <span className="inline-flex items-center gap-1.5"><UserRound size={14} strokeWidth={1.8} /> To‘liq ism</span>
            <input value={profile.name} readOnly className={`${field} bg-subtle text-muted`} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            <span className="inline-flex items-center gap-1.5"><Mail size={14} strokeWidth={1.8} /> Email</span>
            <input type="email" value={profile.email} readOnly className={`${field} bg-subtle text-muted`} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-ink">
            <span className="inline-flex items-center gap-1.5"><Phone size={14} strokeWidth={1.8} /> Telefon</span>
            <input value={profile.phone} onChange={(event) => onChange({ ...profile, phone: event.target.value })} placeholder="+998 90 000 00 00" className={field} />
          </label>
          <div className="grid gap-1.5 text-sm font-medium text-ink">
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
            <h3 className="text-sm font-semibold text-ink">Obuna</h3>
            <p className="mt-1 text-sm text-muted">Haftalik hisobot {profile.email || "Gmail"} va {profile.region} bo‘yicha yuboriladi.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {PLANS.map((plan) => {
                const active = profile.plan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => onChange({ ...profile, plan: plan.id as PlanId, alerts: plan.id === "free" ? profile.alerts : true })}
                    className={cn(
                      "rounded-[10px] border p-4 text-left transition-colors duration-150",
                      active ? "border-accent bg-soft" : "border-line hover:border-accent",
                    )}
                  >
                    <p className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{plan.name}</span>
                      {active && <span className="rounded-full bg-soft px-2 py-0.5 text-[13px] font-semibold text-accent">Tanlangan</span>}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-accent">{plan.price}</p>
                    <ul className="mt-3 grid gap-1.5 text-[13px] text-muted">
                      {plan.points.map((point) => <li key={point}>• {point}</li>)}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-start gap-3 rounded-[10px] bg-subtle p-4">
            <input
              type="checkbox"
              checked={profile.alerts}
              onChange={(event) => onChange({ ...profile, alerts: event.target.checked })}
              className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
            />
            <span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Bell size={14} strokeWidth={1.8} />
                Narx ogohlantirishi
              </span>
              <span className="mt-1 block text-sm text-muted">
                Mahsulot 10% dan ko‘p o‘zgarsa, bildirishnomada ko‘rinadi.
              </span>
            </span>
          </label>
        </div>
      )}
      <button
        type="button"
        onClick={onSave}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-[6px] bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
      >
        <Save size={16} strokeWidth={1.8} />
        {mode === "sozlamalar" && profile.plan !== "free" ? "Obunani saqlash" : "Saqlash"}
      </button>
    </section>
  );
}
