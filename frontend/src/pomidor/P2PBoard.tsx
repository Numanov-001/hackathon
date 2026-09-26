import { PAYMENTS, REGIONS, type P2POffer, type P2PSide } from "./data/p2p";
import P2PPost from "./P2PPost";
import { formatPrice } from "./lib/format";
import { formatLot, formatPhone, formatPosted, phoneHref, priceUnit } from "./lib/unit";
import { cn } from "./lib/cn";
import Select from "./Select";
import type { DeskOfferDraft } from "./hooks/useDeskOffers";
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
  postOpen: boolean;
  onPost: () => void;
  onClosePost: () => void;
  posterName: string;
  posterPhone: string;
  contacts: boolean;
  advice: boolean;
  onUnlock: () => void;
  onPublish: (draft: DeskOfferDraft) => Promise<void>;
};

const field = "h-11 rounded-[6px] border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent";
const OPEN_PHONE = /^\+998\d{9}$/;

function PhoneCell({
  phone,
  contacts,
  onUnlock,
  className,
}: {
  phone: string;
  contacts: boolean;
  onUnlock: () => void;
  className?: string;
}) {
  if (contacts && OPEN_PHONE.test(phone)) {
    return (
      <a href={phoneHref(phone)} className={cn("inline-flex h-11 items-center font-semibold text-accent underline-offset-2 hover:underline", className)}>
        {formatPhone(phone)}
      </a>
    );
  }
  if (contacts) {
    return <span className={cn("inline-flex h-11 items-center text-sm text-muted", className)}>Telefon yo‘q</span>;
  }
  return (
    <button type="button" onClick={onUnlock} className={cn("inline-flex h-11 items-center font-semibold text-muted underline-offset-2 hover:underline", className)}>
      Telefon yopiq
    </button>
  );
}

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
  postOpen,
  onPost,
  onClosePost,
  posterName,
  posterPhone,
  contacts,
  advice,
  onUnlock,
  onPublish,
}: P2PBoardProps) {
  return (
    <section className="w-full rounded-[10px] border border-line bg-surface">
      <div className="sticky top-16 z-10 border-b border-line bg-surface px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-ink">P2P</h2>
            <div className="grid w-full grid-cols-2 rounded-[6px] bg-subtle p-1 sm:flex sm:w-auto" role="group" aria-label="P2P tomoni">
              <button type="button" onClick={() => onSide("buy")} className={cn("min-h-11 rounded-[6px] px-4 text-sm font-semibold transition-colors duration-150", side === "buy" ? "bg-surface text-ink ring-1 ring-line" : "text-muted")}>
                Sotib olish
              </button>
              <button type="button" onClick={() => onSide("sell")} className={cn("min-h-11 rounded-[6px] px-4 text-sm font-semibold transition-colors duration-150", side === "sell" ? "bg-surface text-ink ring-1 ring-line" : "text-muted")}>
                Sotish
              </button>
            </div>
          </div>
          <button type="button" onClick={onPost} className="inline-flex h-11 w-full items-center justify-center rounded-[6px] bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover sm:w-auto">
            E’lon qo‘yish
          </button>
        </div>
        <p className="mt-2 text-[13px] text-muted">
          {side === "buy" ? "Sotuvchilar, arzonidan qimmatiga." : "Xaridorlar, arzonidan qimmatiga."}{" "}
          {contacts ? "Telefon orqali bog‘lanasiz." : "Telefon Starter tarifida ochiladi."}
        </p>

        {postOpen && (
          <P2PPost
            products={products}
            defaultName={posterName}
            defaultPhone={posterPhone}
            defaultProductId={productId || products[0]?.id || ""}
            onClose={onClosePost}
            onSubmit={onPublish}
          />
        )}

        <div className="relative z-20 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
      </div>

      {advice && offers[0] && (
        <p className="border-b border-line bg-soft px-4 py-3 text-sm text-ink sm:px-5">
          Tavsiya: eng arzon {offers[0].seller}, {formatPrice(offers[0].price)} {priceUnit(offers[0].unit)}.
        </p>
      )}

      <div className="hidden overflow-x-auto px-4 lg:block sm:px-5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-[var(--p2p-head,0)]">
            <tr className="border-b border-line text-[13px] text-muted">
              <th className="sticky left-0 bg-surface py-3 pr-3 font-medium">Kim</th>
              <th className="py-3 pr-3 font-medium">Narx</th>
              <th className="py-3 pr-3 font-medium">Miqdor</th>
              <th className="py-3 pr-3 font-medium">Hudud</th>
              <th className="py-3 font-medium">Telefon</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const lot = formatLot(offer.available, offer.unit);
              return (
                <tr key={offer.id} className="border-b border-line last:border-b-0 hover:bg-subtle">
                  <td className="sticky left-0 bg-surface py-3 pr-3">
                    <p className="font-semibold text-ink">{offer.seller}</p>
                    <p className="text-[13px] text-muted">{offer.productName} · {offer.payment} · <time dateTime={offer.postedAt}>{formatPosted(offer.postedAt)}</time></p>
                  </td>
                  <td className="tabular py-3 pr-3 font-semibold">{formatPrice(offer.price)} <span className="text-[13px] font-medium text-muted">{priceUnit(offer.unit)}</span></td>
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-ink">{lot.primary}</p>
                    <p className="text-[13px] text-muted">{lot.secondary}</p>
                  </td>
                  <td className="py-3 pr-3 text-ink">{offer.region}</td>
                  <td className="py-3">
                    <PhoneCell phone={offer.phone} contacts={contacts} onUnlock={onUnlock} className="mt-2" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-0 divide-y divide-line px-4 lg:hidden sm:px-5">
        {offers.map((offer) => {
          const lot = formatLot(offer.available, offer.unit);
          return (
            <article key={offer.id} className="grid gap-2 py-4">
              <div className="min-w-0">
                <p className="text-[13px] text-muted">Kim</p>
                <p className="break-words text-base font-semibold text-ink">{offer.seller}</p>
                <p className="text-[13px] text-muted">{offer.productName} · {offer.payment} · <time dateTime={offer.postedAt}>{formatPosted(offer.postedAt)}</time></p>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div>
                  <dt className="text-[13px] text-muted">Narx</dt>
                  <dd className="tabular font-semibold text-ink">{formatPrice(offer.price)} <span className="text-[13px] font-medium text-muted">{priceUnit(offer.unit)}</span></dd>
                </div>
                <div>
                  <dt className="text-[13px] text-muted">Miqdor</dt>
                  <dd className="font-semibold text-ink">{lot.primary} <span className="block text-[13px] font-medium text-muted">{lot.secondary}</span></dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[13px] text-muted">Hudud</dt>
                  <dd className="font-semibold text-ink">{offer.region}</dd>
                </div>
              </dl>
              <PhoneCell phone={offer.phone} contacts={contacts} onUnlock={onUnlock} />
            </article>
          );
        })}
      </div>
      {offers.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted sm:px-5">Mos e’lon topilmadi. Filtrlarni kengaytiring.</p>}
    </section>
  );
}
