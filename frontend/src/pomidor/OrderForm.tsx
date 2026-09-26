import { Calendar, Lock, MapPin, Phone, Scale, ShoppingCart } from "lucide-react";
import { REGIONS } from "./data/products";
import { formatPrice } from "./lib/format";
import QuantityInput from "./QuantityInput";
import type { Product } from "./types";

type OrderFormProps = {
  product: Product;
  products: Product[];
  kg: number;
  region: string;
  when: string;
  phone: string;
  note: string;
  error: string;
  onProduct: (id: string) => void;
  onKg: (value: number) => void;
  onRegion: (value: string) => void;
  onWhen: (value: string) => void;
  onPhone: (value: string) => void;
  onNote: (value: string) => void;
  onSubmit: () => void;
};

export default function OrderForm({
  product,
  products,
  kg,
  region,
  when,
  phone,
  note,
  error,
  onProduct,
  onKg,
  onRegion,
  onWhen,
  onPhone,
  onNote,
  onSubmit,
}: OrderFormProps) {
  const total = kg * product.price;
  return (
    <section className="h-full min-h-[520px] rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <h2 className="text-base font-semibold text-[#14213D]">Buyurtma yaratish</h2>
      <p className="mt-1 text-sm text-[#667085]">Kerakli ma’lumotlarni to‘ldiring va buyurtma qiling.</p>
      <form
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            Mahsulot
            <select
              value={product.id}
              onChange={(event) => onProduct(event.target.value)}
              className="h-12 rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-sm font-normal outline-none transition-all duration-150 focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12"
            >
              {products.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            <span className="inline-flex items-center gap-1.5">
              <Scale size={14} strokeWidth={1.8} className="text-[#667085]" />
              Hajm (kg)
            </span>
            <QuantityInput value={kg} onChange={onKg} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.8} className="text-[#667085]" />
              Viloyat
            </span>
            <select
              value={region}
              onChange={(event) => onRegion(event.target.value)}
              className="h-12 rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-sm font-normal outline-none transition-all duration-150 focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12"
            >
              {REGIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} strokeWidth={1.8} className="text-[#667085]" />
              Olish sanasi
            </span>
            <input
              type="date"
              value={when}
              onChange={(event) => onWhen(event.target.value)}
              className="h-12 rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-sm font-normal outline-none transition-all duration-150 focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            <span className="inline-flex items-center gap-1.5">
              <Phone size={14} strokeWidth={1.8} className="text-[#667085]" />
              Telefon
            </span>
            <input
              type="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(event) => onPhone(event.target.value)}
              className="h-12 rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-sm font-normal outline-none placeholder:text-[#98A2B3] transition-all duration-150 focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#14213D]">
            Izoh (ixtiyoriy)
            <textarea
              rows={2}
              placeholder="Masalan: 10:00 - 12:00 oralig‘ida"
              value={note}
              onChange={(event) => onNote(event.target.value)}
              className="min-h-12 resize-y rounded-[10px] border border-[#D0D5DD] bg-white px-3 py-3 text-sm font-normal outline-none placeholder:text-[#98A2B3] transition-all duration-150 focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-[#F04438]" role="alert">{error}</p>}
        <div className="mt-5 grid gap-4 rounded-2xl bg-[#F5FBF7] p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#667085]">Jami:</p>
              <p className="text-2xl font-bold tracking-tight text-[#14213D]">{formatPrice(total)} UZS</p>
              <p className="text-xs text-[#667085]">{kg} kg × {formatPrice(product.price)} UZS/kg</p>
            </div>
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#16A05D] px-6 text-sm font-semibold text-white transition-all duration-150 ease-linear hover:bg-[#087A45] hover:shadow-[0_6px_16px_rgba(8,122,69,0.22)] active:translate-y-px"
            >
              <ShoppingCart size={18} strokeWidth={1.8} />
              Sotib olish
            </button>
          </div>
          <p className="flex items-start gap-2 text-xs leading-5 text-[#667085]">
            <Lock size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
            <span>Narx buyurtma tasdiqlanganda aniqlanadi.</span>
          </p>
        </div>
      </form>
    </section>
  );
}
