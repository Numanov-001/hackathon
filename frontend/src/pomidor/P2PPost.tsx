import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { PAYMENTS, REGIONS, type P2PSide } from "./data/p2p";
import { digitsOnly, formatSomInput } from "./lib/format";
import { formatPhoneInput, UNIT_LABEL } from "./lib/unit";
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
const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

function validPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 9 || (digits.length === 12 && digits.startsWith("998"));
}

export default function P2PPost({ products, defaultName, defaultPhone, defaultProductId, onClose, onSubmit }: P2PPostProps) {
  const titleId = useId();
  const panel = useRef<HTMLFormElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [side, setSide] = useState<P2PSide>("sell");
  const [productId, setProductId] = useState(defaultProductId || products[0]?.id || "");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]>("Naqd");
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone ? formatPhoneInput(defaultPhone) : "+998 ");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const product = products.find((item) => item.id === productId);
  const unit = product?.unit ?? "kg";
  const qtyHint = unit === "kg" ? "Kilogramm yozing. 2 000 kg = 2 t." : unit === "m" ? "Metr." : "Qop soni.";

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = panel.current;
    const first = root?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !root) return;
      const nodes = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((item) => !item.hasAttribute("disabled"));
      if (!nodes.length) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);

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
    const priceValue = digitsOnly(price);
    const quantityValue = digitsOnly(quantity);
    if (!Number(priceValue) || !Number(quantityValue)) {
      setError("Narx va miqdor noldan katta bo‘lsin.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onSubmit({ side, productId, price: priceValue, quantity: quantityValue, region, payment, name: name.trim(), phone: phone.trim() });
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

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        className="absolute inset-0 bg-scrim backdrop-blur-sm"
      />
      <form
        ref={panel}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-scroll-panel
        className="enter relative z-10 max-h-[min(88dvh,720px)] w-full max-w-2xl overflow-auto rounded-[16px] border border-line bg-surface p-6 shadow-overlay"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 id={titleId} className="text-xl font-semibold text-ink">E’lon qo‘yish</h3>
            <p className="mt-1 text-[13px] text-muted">Telefon ko‘rinadi. Shu raqam orqali bog‘lanishadi.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Yopish" className="inline-flex size-10 items-center justify-center rounded-[6px] text-muted hover:bg-subtle">
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
        <div className="mb-4 flex rounded-[6px] bg-subtle p-1" role="group" aria-label="E’lon turi">
          <button type="button" onClick={() => setSide("sell")} className={cn("min-h-10 flex-1 rounded-[6px] text-sm font-semibold", side === "sell" ? "bg-accent text-on-accent" : "text-muted")}>
            Sotaman
          </button>
          <button type="button" onClick={() => setSide("buy")} className={cn("min-h-10 flex-1 rounded-[6px] text-sm font-semibold", side === "buy" ? "bg-ink text-on-accent" : "text-muted")}>
            Sotib olaman
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
            <input required inputMode="numeric" value={price} onChange={(event) => setPrice(formatSomInput(event.target.value))} placeholder="9 000" className={`${field} tabular`} />
          </label>
          <label className="grid gap-1 text-[13px] font-medium text-muted">
            Miqdor, {UNIT_LABEL[unit]}
            <input required inputMode="numeric" value={quantity} onChange={(event) => setQuantity(formatSomInput(event.target.value))} placeholder={unit === "kg" ? "2 000" : "100"} className={`${field} tabular`} />
            <span className="font-normal">{qtyHint}</span>
          </label>
          <label className="grid gap-1 text-[13px] font-medium text-muted">
            Ism
            <input required value={name} onChange={(event) => setName(event.target.value)} className={field} />
          </label>
          <label className="grid gap-1 text-[13px] font-medium text-muted">
            Telefon
            <input required type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(formatPhoneInput(event.target.value))} placeholder="+998 90 000 00 00" className={`${field} tabular`} />
          </label>
          <div className="grid gap-1 text-[13px] font-medium text-muted sm:col-span-2">
            To‘lov
            <Select aria-label="To‘lov usuli" className="h-11" value={payment} onChange={(value) => setPayment(value as (typeof PAYMENTS)[number])} options={PAYMENTS.map((item) => ({ value: item, label: item }))} />
          </div>
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-bid">{error}</p>}
        <button type="submit" disabled={busy} className="mt-5 inline-flex h-12 items-center rounded-[6px] bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60">
          {busy ? "Joylanmoqda…" : "E’lonni joylash"}
        </button>
      </form>
    </div>,
    document.body,
  );
}
