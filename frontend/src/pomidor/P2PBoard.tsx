import { BadgeCheck } from "lucide-react";
import { PAYMENTS, REGIONS, type P2POffer, type P2PSide } from "./data/p2p";
import { formatPrice } from "./lib/format";
import { formatPosted, priceUnit, UNIT_LABEL } from "./lib/unit";
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

const field = "h-11 rounded-[6px] border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent";

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
    <section className="rounded-[10px] border border-line bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">P2P niyatlar</h2>
          <p className="text-[13px] text-muted">Sotib olish va sotish e’lonlari. Bu savdo emas.</p>
        </div>
        <div className="flex rounded-[6px] bg-subtle p-1">
          <button type="button" onClick={() => onSide("buy")} className={cn("min-h-10 rounded-[6px] px-4 text-sm font-semibold transition-colors duration-150", side === "buy" ? "bg-accent text-on-accent" : "text-muted")}>
            Sotib olish
          </button>
          <button type="button" onClick={() => onSide("sell")} className={cn("min-h-10 rounded-[6px] px-4 text-sm font-semibold transition-colors duration-150", side === "sell" ? "bg-ink text-on-accent" : "text-muted")}>
            Sotish
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="grid gap-1 text-[13px] font-medium text-muted">
          Mahsulot
          <Select
            aria-label="Mahsulot"
            className="h-11"
            value={productId}
            onChange={onProduct}
            options={[{ value: "", label: "Barchasi" }, ...products.map((item) => ({ value: item.id, label: item.name }))]}
          />
        </div>
        <div className="grid gap-1 text-[13px] font-medium text-muted">
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
        <label className="grid gap-1 text-[13px] font-medium text-muted">
          Maks. narx
          <input type="number" min="0" value={maxPrice} onChange={(event) => onMaxPrice(event.target.value)} placeholder="UZS" className={field} />
        </label>
        <label className="grid gap-1 text-[13px] font-medium text-muted">
          Min. miqdor
          <input type="number" min="0" value={minQty} onChange={(event) => onMinQty(event.target.value)} placeholder="kg / m / qop" className={field} />
        </label>
        <div className="grid gap-1 text-[13px] font-medium text-muted">
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
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead>
            <tr className="text-[13px] text-muted">
              <th className="pb-3 pr-3 font-medium">Sotuvchi</th>
              <th className="pb-3 pr-3 font-medium">Sana</th>
              <th className="pb-3 pr-3 font-medium">Narx</th>
              <th className="pb-3 pr-3 font-medium">Mavjud</th>
              <th className="pb-3 pr-3 font-medium">Limit</th>
              <th className="pb-3 pr-3 font-medium">To‘lov</th>
              <th className="pb-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className="border-t border-line hover:bg-subtle">
                <td className="py-3.5 pr-3">
                  <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    {offer.seller}
                    {offer.verified && <BadgeCheck size={14} className="text-accent" />}
                  </p>
                  <p className="text-[13px] text-muted">{offer.rating}% · {offer.trades} savdo · {offer.region}</p>
                </td>
                <td className="tabular py-3.5 pr-3 text-muted">
                  <time dateTime={offer.postedAt}>{formatPosted(offer.postedAt)}</time>
                </td>
                <td className="tabular py-3.5 pr-3 font-semibold">{formatPrice(offer.price)} <span className="text-[13px] font-medium text-muted">{priceUnit(offer.unit)}</span></td>
                <td className="py-3.5 pr-3">{offer.available} {UNIT_LABEL[offer.unit]} · {offer.productName}</td>
                <td className="py-3.5 pr-3 text-muted">{offer.minQty}–{offer.maxQty} {UNIT_LABEL[offer.unit]}</td>
                <td className="py-3.5 pr-3"><span className="rounded-full bg-subtle px-2 py-0.5 text-[13px] font-medium text-ink">{offer.payment}</span></td>
                <td className="py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onTrade(offer)}
                    className={cn(
                      "h-10 rounded-[6px] px-4 text-sm font-semibold text-on-accent transition-colors duration-150",
                      side === "buy" ? "bg-accent hover:bg-accent-hover" : "bg-ink hover:bg-ink/90",
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
          <article key={offer.id} className="rounded-[10px] border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1 font-semibold">{offer.seller}{offer.verified && <BadgeCheck size={14} className="text-accent" />}</p>
                <p className="text-[13px] text-muted">{offer.rating}% · {offer.trades} savdo</p>
              </div>
              <p className="tabular text-right font-semibold">{formatPrice(offer.price)} <span className="block text-[13px] font-medium text-muted">{priceUnit(offer.unit)}</span></p>
            </div>
            <p className="mt-3 text-sm text-muted">
              {offer.productName} · {offer.available} {UNIT_LABEL[offer.unit]} · {offer.minQty}–{offer.maxQty} {UNIT_LABEL[offer.unit]} ·{" "}
              <time dateTime={offer.postedAt}>{formatPosted(offer.postedAt)}</time>
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="rounded-full bg-subtle px-2 py-0.5 text-[13px]">{offer.payment} · {offer.region}</span>
              <button
                type="button"
                onClick={() => onTrade(offer)}
                className={cn("h-10 rounded-[6px] px-4 text-sm font-semibold text-on-accent", side === "buy" ? "bg-accent" : "bg-ink")}
              >
                {side === "buy" ? "Sotib olish" : "Sotish"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {offers.length === 0 && <p className="py-8 text-center text-sm text-muted">Mos e’lon topilmadi. Filtrlarni kengaytiring.</p>}
    </section>
  );
}
