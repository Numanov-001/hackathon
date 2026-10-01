import { Lock } from "lucide-react";

type PremiumModalProps = {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export default function PremiumModal({ open, onClose, onUpgrade }: PremiumModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-scrim p-4" role="dialog" aria-modal="true" aria-labelledby="premium-title">
      <div className="w-full max-w-md rounded-[10px] border border-line bg-surface p-5 shadow-overlay">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-soft text-accent" aria-hidden="true">
          <Lock size={18} strokeWidth={1.8} />
        </span>
        <p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-accent">Premium</p>
        <h2 id="premium-title" className="mt-2 text-xl font-semibold text-ink">Bu funksiya Premium obunada mavjud</h2>
        <p className="mt-2 text-sm text-muted">Bozor prognozlari, ilg'or tahlil va narx alertlaridan foydalaning.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onUpgrade} className="inline-flex min-h-11 items-center rounded-[6px] bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover">
            Premiumga o'tish
          </button>
          <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center rounded-[6px] border border-line px-4 text-sm font-semibold text-ink hover:bg-subtle">
            Keyinroq
          </button>
        </div>
      </div>
    </div>
  );
}
