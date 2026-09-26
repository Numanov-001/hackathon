import { formatDateTime, formatPrice } from "./lib/format";
import StatusBadge from "./StatusBadge";
import type { Order } from "./types";

export default function OrdersTable({ orders, onRepeat }: { orders: Order[]; onRepeat: (order: Order) => void }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="text-xs font-medium text-[#667085]">
            <th className="pb-3 pr-3">Zakaz ID</th>
            <th className="pb-3 pr-3">Mahsulot</th>
            <th className="pb-3 pr-3">Hajm</th>
            <th className="pb-3 pr-3">Summa</th>
            <th className="pb-3 pr-3">Holat</th>
            <th className="pb-3 pr-3">Sana</th>
            <th className="pb-3">Amal</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-[#E4E7EC] transition-colors duration-150 hover:bg-[#F5FBF7]">
              <td className="py-4 pr-3 font-semibold text-[#14213D]">{order.id}</td>
              <td className="py-3 pr-3">
                <span className="inline-flex items-center gap-2">
                  <img src={order.productImage} alt="" className="h-7 w-7 rounded-full object-cover" />
                  {order.productName}
                </span>
              </td>
              <td className="py-3 pr-3 font-medium">{order.kg} kg</td>
              <td className="py-3 pr-3 font-semibold">{formatPrice(order.total)} UZS</td>
              <td className="py-3 pr-3"><StatusBadge status={order.status} /></td>
              <td className="py-3 pr-3 text-[#667085]">{formatDateTime(order.createdAt)}</td>
              <td className="py-3">
                <button type="button" onClick={() => onRepeat(order)} className="text-xs font-semibold text-[#087A45] hover:underline">
                  Takrorlash
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
