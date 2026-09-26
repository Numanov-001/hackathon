import { useState } from "react";
import { Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import { REGIONS } from "./data/products";
import { CUSTOM_PLAN, PLANS } from "./data/profile";
import Select from "./Select";
import type { PlanId, UserProfile } from "./types";

type AccountPageProps = {
  mode: "profil" | "obuna";
  profile: UserProfile;
  onChange: (next: UserProfile) => void;
  onSave: () => void;
  onChoosePlan?: (plan: PlanId) => Promise<void>;
  onCustom?: () => void;
};

const field = "h-12 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-accent";

export default function AccountPage({ mode, profile, onChange, onSave, onChoosePlan, onCustom }: AccountPageProps) {
  const [busy, setBusy] = useState<PlanId | null>(null);
  const title = mode === "profil" ? "Profil" : "Obuna";

  async function choose(plan: PlanId) {
    if (!onChoosePlan || plan === profile.plan) return;
    setBusy(plan);
    try {
      await onChoosePlan(plan);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={`mx-auto w-full rounded-[10px] border border-line bg-surface p-6 ${mode === "obuna" ? "max-w-5xl" : "max-w-3xl"}`}>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">
        {mode === "profil"
          ? "Ism va email Clerk hisobidan. Rol yo‘q."
          : "Tanlash hisobni ochadi. Click va Payme hali ulanmagan."}
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const current = profile.plan === plan.id;
            return (
              <article key={plan.id} className={`flex flex-col rounded-[10px] border p-4 ${current ? "border-accent bg-soft" : "border-line bg-surface"}`}>
                <p className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{plan.name}</span>
                  {current && <span className="rounded-full bg-surface px-2 py-0.5 text-[13px] font-semibold text-accent">Joriy</span>}
                </p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {plan.price} <span className="text-sm font-medium text-muted">{plan.period}</span>
                </p>
                <ul className="mt-3 grid flex-1 gap-1.5 text-[13px] text-muted">
                  {plan.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <button
                  type="button"
                  disabled={current || busy !== null}
                  aria-current={current ? "true" : undefined}
                  onClick={() => choose(plan.id)}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-[6px] bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:cursor-default disabled:bg-subtle disabled:text-muted"
                >
                  {current ? "Joriy" : busy === plan.id ? "Ochilmoqda" : "Tanlash"}
                </button>
              </article>
            );
          })}
          <article className="flex flex-col rounded-[10px] border border-line bg-surface p-4">
            <p className="font-semibold text-ink">{CUSTOM_PLAN.name}</p>
            <p className="mt-1 text-xl font-semibold text-ink">{CUSTOM_PLAN.price}</p>
            <ul className="mt-3 grid flex-1 gap-1.5 text-[13px] text-muted">
              {CUSTOM_PLAN.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <button
              type="button"
              onClick={onCustom}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-[6px] border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-subtle"
            >
              Bog‘lanish
            </button>
          </article>
        </div>
      )}
      {mode === "profil" && (
        <button
          type="button"
          onClick={onSave}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-[6px] bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
        >
          <Save size={16} strokeWidth={1.8} />
          Saqlash
        </button>
      )}
    </section>
  );
}
