import { useState, type FormEvent } from "react";
import { PAYMENTS, REGIONS, type P2PSide } from "./data/p2p";
import { UNIT_LABEL } from "./lib/unit";
import { cn } from "./lib/cn";
import Select from "./Select";
import type { Product } from "./types";
import type { DeskOfferDraft } from "./hooks/useDeskOffers";

type P2PPostProps = {
  products: Product[];
  defaultName: string;
  defaultPhone: string;
  defaultProductId: string;
  onClose: () => void;
  onSubmit: (draft: DeskOfferDraft) => Promise<void>;
};

const field = "h-11 rounded-[6px] border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent";

function validPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 9 || (digits.length === 12 && digits.startsWith("998"));
}

export default function P2PPost({ products, defaultName, defaultPhone, defaultProductId, onClose, onSubmit }: P2PPostProps) {
  const [side, setSide] = useState<P2PSide>("sell");
  const [productId, setProductId] = useState(defaultProductId || products[0]?.id || "");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]>("Naqd");
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const product = products.find((item) => item.id === productId);
  const unit = product?.unit ?? "kg";
  const qtyHint = unit === "kg" ? "Kilogramm yozing. 2000 kg = 2 tonna." : unit === "m" ? "Metr." : "Qop soni.";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Ismingizni yozing.");
      return;
    }
    if (!validPhone(phone)) {
      setError("Buyurtma uchun telefon shart. +998 va 9 ta raqam.");
      return;
    }
    if (!productId || !region) {
      setError("Mahsulot va hududni tanlang.");
      return;
    }
    if (!Number(price) || !Number(quantity)) {
      setError("Narx va miqdor noldan katta bo‘lsin.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSubmit({ side, productId, price, quantity, region, payment, name: name.trim(), phone: phone.trim() });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      let message = "E’lon joylanmadi. Qayta urinib ko‘ring.";
      try {
        const parsed = JSON.parse(raw) as { detail?: string };
        if (parsed.detail) message = parsed.detail;
      } catch {
        if (raw) message = raw;
      }
      setError(message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-4 rounded-[10px] border border-line bg-subtle p-4" aria-labelledby="p2p-post-title">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 id="p2p-post-title" className="text-base font-semibold text-ink">E’lon qo‘yish</h3>
          <p className="text-[13px] text-muted">Telefon ko‘rinadi. Shu raqam orqali bog‘lanishadi.</p>
        </div>
        <button type="button" onClick={onClose} className="min-h-10 rounded-[6px] px-3 text-sm font-semibold text-muted hover:bg-surface">
          Yopish
        </button>
      </div>
      <div className="mb-3 flex rounded-[6px] bg-surface p-1" role="group" aria-label="E’lon turi">
        <button type="button" onClick={() => setSide("sell")} className={cn("min-h-10 flex-1 rounded-[6px] text-sm font-semibold", side === "sell" ? "bg-accent text-on-accent" : "text-muted")}>
          Sotaman
        </button>
        <button type="button" onClick={() => setSide("buy")} className={cn("min-h-10 flex-1 rounded-[6px] text-sm font-semibold", side === "buy" ? "bg-ink text-on-accent" : "text-muted")}>
          Sotib olaman
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1 text-[13px] font-medium text-muted">
          Mahsulot
          <Select aria-label="E’lon mahsuloti" className="h-11" value={productId} onChange={setProductId} options={products.map((item) => ({ value: item.id, label: item.name }))} />
        </div>
        <div className="grid gap-1 text-[13px] font-medium text-muted">
          Hudud
          <Select aria-label="E’lon hududi" searchable className="h-11" value={region} onChange={setRegion} options={REGIONS.map((item) => ({ value: item, label: item }))} />
        </div>
        <label className="grid gap-1 text-[13px] font-medium text-muted">
          Narx, so‘m / {UNIT_LABEL[unit]}
          <input required inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="9000" className={field} />
        </label>
        <label className="grid gap-1 text-[13px] font-medium text-muted">
          Miqdor, {UNIT_LABEL[unit]}
          <input required inputMode="decimal" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder={unit === "kg" ? "2000" : "100"} className={field} />
          <span className="font-normal">{qtyHint}</span>
        </label>
        <label className="grid gap-1 text-[13px] font-medium text-muted">
          Ism
          <input required value={name} onChange={(event) => setName(event.target.value)} className={field} />
        </label>
        <label className="grid gap-1 text-[13px] font-medium text-muted">
          Telefon
          <input required type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+998 90 000 00 00" className={field} />
        </label>
        <div className="grid gap-1 text-[13px] font-medium text-muted sm:col-span-2">
          To‘lov
          <Select aria-label="To‘lov usuli" className="h-11" value={payment} onChange={(value) => setPayment(value as (typeof PAYMENTS)[number])} options={PAYMENTS.map((item) => ({ value: item, label: item }))} />
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-bid">{error}</p>}
      <button type="submit" disabled={busy} className="mt-4 inline-flex h-12 items-center rounded-[6px] bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60">
        {busy ? "Joylanmoqda…" : "E’lonni joylash"}
      </button>
    </form>
  );
}
