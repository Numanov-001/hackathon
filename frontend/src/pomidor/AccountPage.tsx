import { useRef, useState } from "react";
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

function PlantBed({ featured }: { featured?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className={cn("absolute inset-x-0 top-0 h-1", featured ? "bg-accent" : "bg-accent/40")} />
      <Leaf className="absolute -right-5 bottom-2 h-32 w-32 -rotate-12 text-accent/15" />
      <Sprout className="absolute -left-4 top-20 h-20 w-20 rotate-12 text-accent/20" />
      <Leaf className="absolute right-8 top-10 h-10 w-10 rotate-45 text-accent/10" />
    </div>
  );
}

export default function AccountPage({ mode, profile, onChange, onSave, onChoosePlan, onCustom }: AccountPageProps) {
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [turning, setTurning] = useState<string | null>(null);
  const spun = useRef(new Set<string>());

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

  const cards = [
    ...PLANS.map((plan) => {
      const ui = PLAN_UI[plan.id];
      return {
        key: plan.id,
        name: plan.name,
        blurb: ui.blurb,
        price: plan.price,
        period: plan.period,
        points: plan.points,
        Icon: ui.Icon,
        featured: Boolean(ui.featured),
        current: profile.plan === plan.id,
        cta: profile.plan === plan.id ? "Joriy" : busy === plan.id ? "Ochilmoqda" : plan.id === "free" ? "Bepul ishlatish" : `${plan.name} olish`,
        outline: Boolean(ui.featured),
        onClick: () => choose(plan.id),
        disabled: profile.plan === plan.id || busy !== null,
      };
    }),
    {
      key: "custom",
      name: CUSTOM_PLAN.name,
      blurb: "Katta savdo va API.",
      price: CUSTOM_PLAN.price,
      period: "",
      points: CUSTOM_PLAN.points,
      Icon: Handshake,
      featured: false,
      current: false,
      cta: "Bog‘lanish",
      outline: true,
      onClick: () => onCustom?.(),
      disabled: false,
    },
  ];

  return (
    <section className="relative mx-auto w-full max-w-[1200px]" aria-labelledby="obuna-title">
      <Leaf className="pointer-events-none absolute left-0 top-0 h-16 w-16 text-accent/20" aria-hidden="true" />
      <Sprout className="pointer-events-none absolute right-2 top-10 h-14 w-14 text-accent/20" aria-hidden="true" />

      <header className="relative mx-auto max-w-2xl text-center">
        <h2 id="obuna-title" className="text-[32px] font-semibold leading-[1.2] text-ink">
          Tariflar siz bilan o‘sadi
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">Tanlash hisobni ochadi. Click va Payme hali ulanmagan.</p>
      </header>

      <div className="relative mt-10 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.key}
              className="plan-stage h-full"
              onMouseEnter={() => {
                if (spun.current.has(card.key)) return;
                spun.current.add(card.key);
                setTurning(card.key);
              }}
              onMouseLeave={() => {
                spun.current.delete(card.key);
                setTurning((current) => (current === card.key ? null : current));
              }}
            >
              <article
                className={cn(
                  "plan-card relative flex h-full flex-col overflow-hidden rounded-[16px] border bg-soft p-6",
                  card.featured ? "border-accent" : "border-line",
                  turning === card.key && "is-turning",
                )}
                onAnimationEnd={() => setTurning((current) => (current === card.key ? null : current))}
              >
                <PlantBed featured={card.featured} />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-accent">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    {card.current && (
                      <span className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-accent">Joriy</span>
                    )}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold leading-[1.2] text-ink">{card.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{card.blurb}</p>
                  <p className="mt-8 flex flex-wrap items-end gap-2 text-ink">
                    <span className="tabular text-[32px] font-semibold leading-none">{card.price}</span>
                    {card.period ? <span className="pb-0.5 text-sm text-muted">{card.period}</span> : null}
                  </p>
                  <button
                    type="button"
                    disabled={card.disabled}
                    aria-current={card.current ? "true" : undefined}
                    onClick={card.onClick}
                    className={cn(
                      "mt-6 h-12 w-full rounded-full text-sm font-semibold transition-colors duration-200",
                      card.outline && !card.current
                        ? "border border-accent bg-surface text-accent hover:bg-accent hover:text-on-accent"
                        : "bg-accent text-on-accent hover:bg-accent-hover",
                      "disabled:cursor-default disabled:border-transparent disabled:bg-subtle disabled:text-muted",
                    )}
                  >
                    {card.cta}
                  </button>
                  <p className="mt-2 text-center text-[13px] leading-5 text-muted">Majburiyat yo‘q. Istalgan vaqt o‘zgartirasiz.</p>
                  <ul className="mt-8 grid gap-3">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-ink">
                        <Check size={16} strokeWidth={2} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
