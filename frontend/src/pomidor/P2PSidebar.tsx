import { formatPrice } from "./lib/format";
import type { P2POffer } from "./data/p2p";

export default function P2PSidebar({ offers, avg }: { offers: P2POffer[]; avg: number }) {
  const buy = offers.filter((item) => item.side === "buy").length;
  const sell = offers.filter((item) => item.side === "sell").length;
  return (
    <aside className="rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <h2 className="text-base font-semibold text-[#14213D]">P2P statistikasi</h2>
      <p className="mt-1 text-xs text-[#667085]">Joriy e’lonlar va o‘rtacha taklif narxi</p>
      <dl className="mt-4 grid gap-3">
        <div className="rounded-2xl bg-[#F5FBF7] p-3">
          <dt className="text-xs text-[#667085]">Faol e’lonlar</dt>
          <dd className="text-2xl font-bold">{offers.length}</dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#E4E7EC] p-3">
            <dt className="text-xs text-[#667085]">Sotib olish</dt>
            <dd className="font-semibold text-[#16A05D]">{buy}</dd>
          </div>
          <div className="rounded-2xl border border-[#E4E7EC] p-3">
            <dt className="text-xs text-[#667085]">Sotish</dt>
            <dd className="font-semibold text-[#14213D]">{sell}</dd>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E4E7EC] p-3">
          <dt className="text-xs text-[#667085]">O‘rtacha taklif</dt>
          <dd className="font-semibold">{formatPrice(avg)} UZS/kg</dd>
        </div>
      </dl>
    </aside>
  );
}
