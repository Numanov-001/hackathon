import { formatPrice } from "./lib/format";
import { formatPosted } from "./lib/unit";
import type { P2POffer } from "./data/p2p";

export default function P2PSidebar({ offers, avg }: { offers: P2POffer[]; avg: number }) {
  const buy = offers.filter((item) => item.side === "buy").length;
  const sell = offers.filter((item) => item.side === "sell").length;
  const newest = offers[0]?.postedAt;

  return (
    <aside className="rounded-[10px] border border-line bg-surface p-5">
      <h2 className="text-base font-semibold text-ink">P2P statistikasi</h2>
      <p className="mt-1 text-[13px] text-muted">Joriy e’lonlar va o‘rtacha taklif narxi</p>
      <dl className="mt-4 grid gap-3">
        <div className="rounded-[10px] bg-subtle p-3">
          <dt className="text-[13px] text-muted">Faol e’lonlar</dt>
          <dd className="tabular text-2xl font-semibold">{offers.length}</dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[10px] border border-line p-3">
            <dt className="text-[13px] text-muted">Sotib olish</dt>
            <dd className="font-semibold text-ask">{buy}</dd>
          </div>
          <div className="rounded-[10px] border border-line p-3">
            <dt className="text-[13px] text-muted">Sotish</dt>
            <dd className="font-semibold text-ink">{sell}</dd>
          </div>
        </div>
        <div className="rounded-[10px] border border-line p-3">
          <dt className="text-[13px] text-muted">O‘rtacha (kg)</dt>
          <dd className="tabular font-semibold">{formatPrice(avg)} UZS/kg</dd>
        </div>
        <div className="rounded-[10px] border border-line p-3">
          <dt className="text-[13px] text-muted">Oxirgi e’lon</dt>
          <dd className="font-semibold text-ink">
            {newest ? <time dateTime={newest}>{formatPosted(newest)}</time> : "—"}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
