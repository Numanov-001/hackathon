import { formatPrice } from "./lib/format";
import { formatLot, priceUnit } from "./lib/unit";
import type { MatchRow } from "./lib/match";

type SmartMatchProps = {
  rows: MatchRow[];
  contacts: boolean;
  onUnlock: () => void;
  onOpenP2P: () => void;
};

export default function SmartMatch({ rows, contacts, onUnlock, onOpenP2P }: SmartMatchProps) {
  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink">Smart Match</h2>
          <p className="text-[13px] text-muted">Moslik haqiqiy sotuv va xarid e’lonlaridan hisoblanadi.</p>
        </div>
        <button type="button" onClick={onOpenP2P} className="text-[13px] font-semibold text-accent hover:underline">P2P</button>
      </div>
      {!rows.length ? (
        <p className="text-sm text-muted">Hozircha mos juftlik yo‘q.</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-[10px] border border-line px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">{row.productName}</p>
                <p className="text-sm font-semibold text-accent">{row.score}% moslik</p>
              </div>
              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <p className="text-muted">Sotuvchi: <span className="text-ink">{row.seller.region}</span> · {formatLot(row.seller.available, row.seller.unit).primary} · {formatPrice(row.seller.price)} {priceUnit(row.seller.unit)}</p>
                <p className="text-muted">Xaridor: <span className="text-ink">{row.buyer.region}</span> · {formatLot(row.buyer.available, row.buyer.unit).primary} · max {formatPrice(row.buyer.price)}</p>
              </div>
              <button type="button" onClick={contacts ? onOpenP2P : onUnlock} className="mt-3 inline-flex min-h-10 items-center rounded-[6px] bg-accent px-3 text-[13px] font-semibold text-on-accent">
                Bog'lanish
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
