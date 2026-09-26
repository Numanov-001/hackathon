import { useState } from "react";
import { Check, Handshake, Leaf, Mail, MapPin, Phone, Save, Sprout, UserRound, Warehouse } from "lucide-react";
import { REGIONS } from "./data/products";
import { CUSTOM_PLAN, PLANS } from "./data/profile";
import Select from "./Select";
import { cn } from "./lib/cn";
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

const PLAN_UI: Record<PlanId, { blurb: string; Icon: typeof Leaf; featured?: boolean }> = {
  free: { blurb: "Bozorni ko'ring, P2P ni o'qing.", Icon: Leaf, featured: true },
  starter: { blurb: "Sotuvchi va xaridor uchun.", Icon: Sprout },
  business: { blurb: "Jamoa va ko'proq e'lon.", Icon: Warehouse },
};

export default function AccountPage({ mode, profile, onChange, onSave, onChoosePlan, onCustom }: AccountPageProps) {
  const [busy, setBusy] = useState<PlanId | null>(null);

  async function choose(plan: PlanId) {
    if (!onChoosePlan || plan === profile.plan) return;
    setBusy(plan);
    try {
      await onChoosePlan(plan);
    } finally {
      setBusy(null);
    }
  }

  if (mode === "profil") {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-[10px] border border-line bg-surface p-6">
        <h2 className="text-xl font-semibold text-ink">Profil</h2>
        <p className="mt-1 text-sm text-muted">Ism va email Clerk hisobidan. Rol yo‘q.</p>
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
        <button type="button" onClick={onSave} className="mt-6 inline-flex h-12 items-center gap-2 rounded-[6px] bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover">
          <Save size={16} strokeWidth={1.8} />
          Saqlash
        </button>
      </section>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-[1180px] overflow-hidden px-1" aria-labelledby="obuna-title">
      <Leaf className="pointer-events-none absolute -left-1 top-2 h-14 w-14 text-accent/15" aria-hidden="true" />
      <Sprout className="pointer-events-none absolute right-0 top-8 h-12 w-12 text-accent/15" aria-hidden="true" />

      <header className="relative mx-auto max-w-xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">Obuna</p>
        <h2 id="obuna-title" className="mt-2 text-[32px] font-semibold leading-[1.2] text-ink">
          Tariflar siz bilan o‘sadi
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">Tanlash hisobni ochadi. Click va Payme hali ulanmagan.</p>
      </header>

      <div className="relative mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const current = profile.plan === plan.id;
          const ui = PLAN_UI[plan.id];
          const Icon = ui.Icon;
          return (
            <article
              key={plan.id}
              className={cn(
                "flex min-h-[28rem] flex-col rounded-[16px] border bg-surface p-6",
                ui.featured ? "border-accent bg-soft" : "border-line",
                current && !ui.featured && "border-accent",
              )}
            >
              <Icon size={22} strokeWidth={1.6} className="text-accent" aria-hidden="true" />
              <div className="mt-5 flex items-start justify-between gap-2">
                <h3 className="text-xl font-semibold leading-[1.2] text-ink">{plan.name}</h3>
                {current && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[13px] font-semibold text-accent">Joriy</span>
                )}
              </div>
              <p className="mt-1 text-sm leading-6 text-muted">{ui.blurb}</p>
              <p className="mt-6 flex items-end gap-1.5 text-ink">
                <span className="tabular text-[32px] font-semibold leading-none">{plan.price}</span>
                <span className="pb-1 text-sm text-muted">{plan.period}</span>
              </p>
              <button
                type="button"
                disabled={current || busy !== null}
                aria-current={current ? "true" : undefined}
                onClick={() => choose(plan.id)}
                className={cn(
                  "mt-5 h-11 w-full rounded-full text-sm font-semibold transition-colors duration-200",
                  ui.featured && !current
                    ? "border border-accent bg-surface text-accent hover:bg-accent hover:text-on-accent"
                    : "bg-accent text-on-accent hover:bg-accent-hover",
                  "disabled:cursor-default disabled:bg-subtle disabled:text-muted disabled:opacity-100",
                )}
              >
                {current ? "Joriy" : busy === plan.id ? "Ochilmoqda" : "Tanlash"}
              </button>
              <ul className="mt-6 grid flex-1 gap-2.5">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-[13px] leading-5 text-ink">
                    <Check size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}

        <article className="flex min-h-[28rem] flex-col rounded-[16px] border border-line bg-surface p-6">
          <Handshake size={22} strokeWidth={1.6} className="text-accent" aria-hidden="true" />
          <h3 className="mt-5 text-xl font-semibold leading-[1.2] text-ink">{CUSTOM_PLAN.name}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">Katta savdo va API.</p>
          <p className="tabular mt-6 text-[32px] font-semibold leading-none text-ink">{CUSTOM_PLAN.price}</p>
          <button
            type="button"
            onClick={onCustom}
            className="mt-5 h-11 w-full rounded-full border border-accent bg-surface text-sm font-semibold text-accent transition-colors duration-200 hover:bg-accent hover:text-on-accent"
          >
            Bog‘lanish
          </button>
          <ul className="mt-6 grid flex-1 gap-2.5">
            {CUSTOM_PLAN.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-[13px] leading-5 text-ink">
                <Check size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
