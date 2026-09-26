import { formatPrice } from "./mockData.js";

function timeLabel(iso) {
  return new Date(iso).toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

function dateLabel(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("uz-UZ");
}

export default function OrderTable({ orders }) {
  return (
    <section className="shrink-0 border-t border-[#e8e2d6] bg-[#f7f4ee]" aria-labelledby="orders-title">
      <div className="flex items-end justify-between px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#4e5a54]">Buyurtmalar</p>
          <h2 id="orders-title" className="text-[16px] font-semibold text-[#1c2420]">Zakazlar</h2>
        </div>
        <p className="rounded-full bg-white px-2.5 py-1 text-[12px] text-[#4e5a54]">{orders.length} ta</p>
      </div>
      {orders.length === 0 ? (
        <div className="mx-4 mb-4 rounded-xl border border-dashed border-[#d5cfc3] bg-white px-4 py-6 text-center text-[13px] text-[#4e5a54]">
          Hali zakaz yo‘q. O‘ngdan kg, viloyat, sana va telefonni to‘ldiring.
        </div>
      ) : (
        <div className="mx-4 mb-4 max-h-48 overflow-auto rounded-xl border border-[#d5cfc3] bg-white">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 bg-[#e8e2d6] text-[#4e5a54]">
              <tr>
                <th className="px-3 py-2 font-medium">Mahsulot</th>
                <th className="px-3 py-2 font-medium">Hajm</th>
                <th className="px-3 py-2 font-medium">Viloyat</th>
                <th className="px-3 py-2 font-medium">Olish</th>
                <th className="px-3 py-2 font-medium">Telefon</th>
                <th className="px-3 py-2 font-medium">Jami</th>
                <th className="px-3 py-2 font-medium">Holat</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-[#eee8dc]">
                  <td className="px-3 py-2.5 font-medium text-[#1c2420]">
                    <span className="mr-1" aria-hidden="true">{order.emoji}</span>
                    {order.name}
                    <div className="tv-num text-[11px] font-normal text-[#4e5a54]">{formatPrice(order.pricePerKg)} UZS/kg · {timeLabel(order.createdAt)}</div>
                  </td>
                  <td className="tv-num px-3 py-2.5">{order.kg} kg</td>
                  <td className="px-3 py-2.5">{order.region}</td>
                  <td className="px-3 py-2.5">{dateLabel(order.when)}</td>
                  <td className="tv-num px-3 py-2.5">{order.phone}</td>
                  <td className="tv-num px-3 py-2.5 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-[#e3f2ea] px-2 py-0.5 text-[11px] font-semibold text-[#146b43]">{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
