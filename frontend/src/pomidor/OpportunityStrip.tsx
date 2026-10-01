import { formatPrice, signedPct } from "./lib/format";
import type { RegionSpread } from "./lib/match";

type OpportunityStripProps = {
  rows: RegionSpread[];
  premium: boolean;
  onLock: () => void;
  onOpen: (id: string) => void;
};

export default function OpportunityStrip({ rows, premium, onLock, onOpen }: OpportunityStripProps) {
  if (!rows.length) {
    return (
      <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
        <h2 className="text-xl font-semibold text-ink">Bozor imkoniyatlari</h2>
        <p className="mt-2 text-sm text-muted">Hududiy farq faqat haqiqiy P2P e’lonlaridan. Hozircha yetarli listing yo‘q.</p>
      </section>
    );
  }
  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink">Bozor imkoniyatlari</h2>
          <p className="text-[13px] text-muted">P2P e’lonlaridagi hududiy narx farqi. SIAT milliy o‘rtacha.</p>
        </div>
        {!premium && (
          <button type="button" onClick={onLock} className="rounded-full bg-soft px-3 py-1 text-[12px] font-semibold text-accent">Premium</button>
        )}
      </div>
      {premium ? (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => (
            <button key={row.productId} type="button" onClick={() => onOpen(row.productId)} className="rounded-[10px] border border-line px-4 py-3 text-left hover:bg-subtle">
              <p className="font-semibold text-ink">{row.productName}</p>
              <p className="mt-2 text-sm text-muted">{row.lowRegion}: <span className="tabular font-semibold text-ink">{formatPrice(row.lowPrice)} so'm/kg</span></p>
              <p className="text-sm text-muted">{row.highRegion}: <span className="tabular font-semibold text-ink">{formatPrice(row.highPrice)} so'm/kg</span></p>
              <p className="mt-2 text-sm font-semibold text-ask">Farq {signedPct(row.difference)}</p>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Hududlar taqqoslash Premium obunada.</p>
      )}
    </section>
  );
}
