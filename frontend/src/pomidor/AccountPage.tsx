import { useRef, useState } from "react";
import { ArrowRight, Building2, Check, Handshake, Leaf, Mail, MapPin, Phone, Save, Sprout, UserRound } from "lucide-react";
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

const PLAN_UI: Record<PlanId, { blurb: string; Icon: typeof Leaf; featured?: boolean; cta: string }> = {
  free: { blurb: "Narx va asosiy P2P.", Icon: Leaf, cta: "FREE" },
  starter: { blurb: "Birinchi oy bepul. Kartasiz ochiladi.", Icon: Sprout, featured: true, cta: "PRO ni ochish" },
  business: { blurb: "Jamoa va API.", Icon: Building2, cta: "BUSINESS so‘rash" },
  premium_monthly: { blurb: "Prognoz va tahlil.", Icon: Sprout, cta: "PRO so‘rash" },
  premium_yearly: { blurb: "Yillik PRO.", Icon: Building2, cta: "Yillik so‘rash" },
};

function BotanicLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 96" className={className} fill="currentColor" aria-hidden="true">
      <path d="M32 94c1-22 4-36 4-50C36 22 32 8 32 8S28 22 28 44c0 14 3 28 4 50Z" opacity="0.35" />
      <path d="M32 8c-2 16-24 28-24 50 0 16 10 26 24 36 14-10 24-20 24-36C56 36 34 24 32 8Z" />
    </svg>
  );
}

function CardLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[16px]" aria-hidden="true">
      <BotanicLeaf className="absolute -bottom-5 -left-2 h-20 w-14 -rotate-[28deg] text-accent/20" />
      <BotanicLeaf className="absolute -bottom-6 left-10 h-16 w-11 rotate-[18deg] text-accent/14" />
      <BotanicLeaf className="absolute -bottom-4 -right-1 h-[5.5rem] w-16 rotate-[32deg] text-accent/22" />
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
        <p className="mt-1 text-sm text-muted">Ism va email Clerk hisobidan.</p>
        <p className="mt-2 text-sm text-muted">Obuna: {profile.premium ? "PRO" : "FREE"} · Rol: {profile.role === "admin" ? "ADMIN" : "USER"}{profile.subscriptionExpiry ? ` · Tugash: ${profile.subscriptionExpiry.slice(0, 10)}` : ""}</p>
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
        <div className="mt-6 grid gap-3 text-sm">
          <p className="font-medium text-ink">Mening P2P e’lonlarim</p>
          <p className="text-muted">E’lonlaringiz P2P bo‘limida, tizim hisobiga bog‘langan holda ko‘rinadi.</p>
          <p className="font-medium text-ink">Mening so‘rovlarim</p>
          <p className="text-muted">Xarid so‘rovlari P2P «Sotib olaman» ro‘yxatida.</p>
          <p className="font-medium text-ink">Mening alertlarim</p>
          <p className="text-muted">Narx alertlari Bozor sahifasida saqlanadi (qurilmada).</p>
          <p className="font-medium text-ink">Saqlangan mahsulotlar</p>
          <p className="text-muted">Kuzatuv ro‘yxati Bozor sahifasidagi watchlist orqali.</p>
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
        cta: profile.plan === plan.id ? "Joriy" : busy === plan.id ? "Ochilmoqda" : ui.cta,
        outline: !ui.featured,
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
    <section className="relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-[16px] bg-soft px-3 py-8 sm:px-4 sm:py-10 lg:px-8" aria-labelledby="obuna-title">
      <BotanicLeaf className="pointer-events-none absolute left-[10%] top-20 h-8 w-6 -rotate-[40deg] text-accent/35" />
      <BotanicLeaf className="pointer-events-none absolute right-[11%] top-24 h-8 w-6 rotate-[38deg] text-accent/35" />
      <BotanicLeaf className="pointer-events-none absolute bottom-4 left-6 h-12 w-8 -rotate-[24deg] text-accent/20" />
      <BotanicLeaf className="pointer-events-none absolute bottom-5 right-8 h-12 w-8 rotate-[26deg] text-accent/20" />

      <header className="relative mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
          <Leaf size={14} strokeWidth={1.8} aria-hidden="true" />
          Tariflar
        </p>
        <h2 id="obuna-title" className="mt-4 text-2xl font-semibold leading-[1.2] text-ink sm:text-[32px]">
          Siz uchun eng qulay tarif
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          PRO 1 oy bepul, karta so‘ralmaydi. Kirgan zahoti ochiladi.
          {profile.promoUntil ? ` Aksiya: ${profile.promoUntil.slice(0, 10)} gacha.` : ""}
          {profile.trial && profile.subscriptionExpiry ? ` Sizning PRO ${profile.subscriptionExpiry.slice(0, 10)} gacha.` : ""}
        </p>
      </header>

      <div className="relative mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.key}
              className="plan-stage h-full pt-3"
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
                  "plan-card relative flex h-full flex-col overflow-visible rounded-[16px] bg-surface p-4 shadow-overlay sm:p-6",
                  card.featured ? "border-2 border-accent" : "border border-line",
                  turning === card.key && "is-turning",
                )}
                onAnimationEnd={() => setTurning((current) => (current === card.key ? null : current))}
              >
                <CardLeaves />
                {card.featured && (
                  <p className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-semibold text-accent">
                    <Sprout size={14} strokeWidth={1.8} aria-hidden="true" />
                    Tavsiya etilgan
                  </p>
                )}
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-soft text-accent">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    {card.current && (
                      <span className="rounded-full bg-soft px-2.5 py-1 text-[13px] font-semibold text-accent">Joriy</span>
                    )}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold leading-[1.2] text-ink">{card.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{card.blurb}</p>
                  <p className="mt-6 flex flex-wrap items-end gap-1.5 text-ink">
                    <span className="tabular text-[28px] font-semibold leading-none sm:text-[32px]">{card.price}</span>
                    {card.period ? <span className="pb-0.5 text-sm text-muted">{card.period}</span> : null}
                  </p>
                  <button
                    type="button"
                    disabled={card.disabled}
                    aria-current={card.current ? "true" : undefined}
                    onClick={card.onClick}
                    className={cn(
                      "mt-6 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors duration-200",
                      card.outline && !card.current
                        ? "border border-accent bg-surface text-accent hover:bg-accent hover:text-on-accent"
                        : "bg-accent text-on-accent hover:bg-accent-hover",
                      "disabled:cursor-default disabled:border-transparent disabled:bg-subtle disabled:text-muted",
                    )}
                  >
                    {card.cta}
                    {!card.current && <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />}
                  </button>
                  <ul className="mt-6 grid gap-2.5">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-ink">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-soft text-accent">
                          <Check size={12} strokeWidth={2.4} aria-hidden="true" />
                        </span>
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
