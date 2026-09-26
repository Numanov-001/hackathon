import { ChevronRight, Package } from "lucide-react";
import OrdersTable from "./OrdersTable";
import type { Order } from "./types";

type OrdersPanelProps = {
  orders: Order[];
  onCreate: () => void;
  onRepeat: (order: Order) => void;
};

export default function OrdersPanel({ orders, onCreate, onRepeat }: OrdersPanelProps) {
  const active = orders.filter((item) => item.status !== "Yakunlangan");
  return (
    <section className="min-h-[420px] rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#14213D]">Mening zakazlarim</h2>
          <p className="mt-1 max-w-md text-sm text-[#667085]">
            Sizning buyurtmalaringiz bu yerda ko‘rinadi. Yangi xarid qilinganda avtomatik qo‘shiladi.
          </p>
        </div>
        <button type="button" className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#087A45] hover:underline">
          Barchasi
          <ChevronRight size={14} strokeWidth={1.8} />
        </button>
      </div>
      {active.length === 0 && (
        <div className="mt-6 grid place-items-center rounded-2xl bg-[#F5FBF7] px-4 py-10 text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF8F0] text-[#16A05D]">
            <Package size={28} strokeWidth={1.8} />
          </div>
          <p className="font-semibold text-[#14213D]">Hozircha buyurtmalar yo‘q</p>
          <p className="mt-1 max-w-sm text-sm text-[#667085]">
            Birinchi buyurtmangizni qiling va bu yerda ularning holatini kuzatib boring.
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[10px] bg-[#16A05D] px-5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#087A45]"
          >
            Buyurtma qilish
          </button>
        </div>
      )}
      <OrdersTable orders={orders} onRepeat={onRepeat} />
    </section>
  );
}
