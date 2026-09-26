import { BadgeCheck } from "lucide-react";
import { PAYMENTS, REGIONS, type P2POffer, type P2PSide } from "./data/p2p";
import { formatPrice } from "./lib/format";
import { cn } from "./lib/cn";
import Select from "./Select";
import type { Product } from "./types";

type P2PBoardProps = {
  side: P2PSide;
  onSide: (side: P2PSide) => void;
  productId: string;
  onProduct: (id: string) => void;
  region: string;
  onRegion: (value: string) => void;
  payment: string;
  onPayment: (value: string) => void;
  maxPrice: string;
  onMaxPrice: (value: string) => void;
  minQty: string;
  onMinQty: (value: string) => void;
  products: Product[];
  offers: P2POffer[];
  onTrade: (offer: P2POffer) => void;
};

const field = "h-11 rounded-[10px] border border-[#E4E7EC] bg-white px-3 text-sm text-[#14213D] outline-none focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12";

export default function P2PBoard({
  side,
  onSide,
  productId,
  onProduct,
  region,
  onRegion,
  payment,
  onPayment,
  maxPrice,
  onMaxPrice,
  minQty,
  onMinQty,
  products,
  offers,
  onTrade,
}: P2PBoardProps) {
  return (
    <section className="rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2E90FA]">P2P</p>
          <h2 className="text-lg font-semibold text-[#14213D]">P2P Bozor</h2>
        </div>
        <div className="flex rounded-xl bg-[#F5FBF7] p-1">
          <button type="button" onClick={() => onSide("buy")} className={cn("rounded-[10px] px-4 py-2 text-sm font-semibold transition-all duration-150", side === "buy" ? "bg-[#16A05D] text-white" : "text-[#667085]")}>
            Sotib olish
          </button>
          <button type="button" onClick={() => onSide("sell")} className={cn("rounded-[10px] px-4 py-2 text-sm font-semibold transition-all duration-150", side === "sell" ? "bg-[#14213D] text-white" : "text-[#667085]")}>
            Sotish
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="grid gap-1 text-xs font-medium text-[#667085]">
          Mahsulot
          <Select
            aria-label="Mahsulot"
            className="h-11"
            value={productId}
            onChange={onProduct}
            options={[{ value: "", label: "Barchasi" }, ...products.map((item) => ({ value: item.id, label: item.name }))]}
          />
        </div>
        <div className="grid gap-1 text-xs font-medium text-[#667085]">
          Hudud
          <Select
            aria-label="Hudud"
            searchable
            className="h-11"
            value={region}
            onChange={onRegion}
            options={[{ value: "", label: "Barchasi" }, ...REGIONS.map((item) => ({ value: item, label: item }))]}
          />
        </div>
        <label className="grid gap-1 text-xs font-medium text-[#667085]">
          Maks. narx
          <input type="number" min="0" value={maxPrice} onChange={(event) => onMaxPrice(event.target.value)} placeholder="UZS/kg" className={field} />
        </label>
        <label className="grid gap-1 text-xs font-medium text-[#667085]">
          Min. miqdor
          <input type="number" min="0" value={minQty} onChange={(event) => onMinQty(event.target.value)} placeholder="kg" className={field} />
        </label>
        <div className="grid gap-1 text-xs font-medium text-[#667085]">
          To‘lov
          <Select
            aria-label="To‘lov"
            className="h-11"
            value={payment}
            onChange={onPayment}
            options={[{ value: "", label: "Barchasi" }, ...PAYMENTS.map((item) => ({ value: item, label: item }))]}
          />
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="text-xs text-[#667085]">
              <th className="pb-3 pr-3 font-medium">Sotuvchi</th>
              <th className="pb-3 pr-3 font-medium">Narx</th>
              <th className="pb-3 pr-3 font-medium">Mavjud</th>
              <th className="pb-3 pr-3 font-medium">Limit</th>
              <th className="pb-3 pr-3 font-medium">To‘lov</th>
              <th className="pb-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className="border-t border-[#E4E7EC] hover:bg-[#F5FBF7]">
                <td className="py-3.5 pr-3">
                  <p className="inline-flex items-center gap-1.5 font-semibold text-[#14213D]">
                    {offer.seller}
                    {offer.verified && <BadgeCheck size={14} className="text-[#2E90FA]" />}
                  </p>
                  <p className="text-xs text-[#667085]">{offer.rating}% · {offer.trades} savdo · {offer.region}</p>
                </td>
                <td className="py-3.5 pr-3 font-semibold">{formatPrice(offer.price)} <span className="text-xs font-medium text-[#667085]">UZS/kg</span></td>
                <td className="py-3.5 pr-3">{offer.available} kg · {offer.productName}</td>
                <td className="py-3.5 pr-3 text-[#667085]">{offer.minKg}–{offer.maxKg} kg</td>
                <td className="py-3.5 pr-3"><span className="rounded-full bg-[#F5FBF7] px-2 py-0.5 text-xs font-medium text-[#14213D]">{offer.payment}</span></td>
                <td className="py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onTrade(offer)}
                    className={cn(
                      "h-10 rounded-[10px] px-4 text-sm font-semibold text-white transition-all duration-150",
                      side === "buy" ? "bg-[#16A05D] hover:bg-[#087A45]" : "bg-[#14213D] hover:bg-[#0f182c]",
                    )}
                  >
                    {side === "buy" ? "Sotib olish" : "Sotish"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {offers.map((offer) => (
          <article key={offer.id} className="rounded-2xl border border-[#E4E7EC] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1 font-semibold">{offer.seller}{offer.verified && <BadgeCheck size={14} className="text-[#2E90FA]" />}</p>
                <p className="text-xs text-[#667085]">{offer.rating}% · {offer.trades} savdo</p>
              </div>
              <p className="text-right font-semibold">{formatPrice(offer.price)} <span className="block text-xs font-medium text-[#667085]">UZS/kg</span></p>
            </div>
            <p className="mt-3 text-sm text-[#667085]">{offer.productName} · {offer.available} kg · {offer.minKg}–{offer.maxKg} kg</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#F5FBF7] px-2 py-0.5 text-xs">{offer.payment} · {offer.region}</span>
              <button
                type="button"
                onClick={() => onTrade(offer)}
                className={cn("h-10 rounded-[10px] px-4 text-sm font-semibold text-white", side === "buy" ? "bg-[#16A05D]" : "bg-[#14213D]")}
              >
                {side === "buy" ? "Sotib olish" : "Sotish"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {offers.length === 0 && <p className="py-8 text-center text-sm text-[#667085]">Mos e’lon topilmadi. Filtrlarni kengaytiring.</p>}
    </section>
  );
}
