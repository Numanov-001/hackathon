import { useMemo, useState } from "react";
import Select from "./Select";
import { formatPrice } from "./lib/format";
import type { Product } from "./types";

type ProfitCalculatorProps = {
  products: Product[];
  premium: boolean;
  onLock: () => void;
};

export default function ProfitCalculator({ products, premium, onLock }: ProfitCalculatorProps) {
  const [productId, setProductId] = useState(products[0]?.id ?? "pomidor");
  const [qty, setQty] = useState("1000");
  const [buy, setBuy] = useState("");
  const [sell, setSell] = useState("");
  const [logistics, setLogistics] = useState("");
  const [extra, setExtra] = useState("");
  const product = products.find((item) => item.id === productId) ?? products[0];

  const result = useMemo(() => {
    const amount = Number(qty) || 0;
    const buyPrice = Number(buy) || product?.price || 0;
    const sellPrice = Number(sell) || 0;
    const transport = Number(logistics) || 0;
    const other = Number(extra) || 0;
    const purchase = amount * buyPrice;
    const revenue = amount * sellPrice;
    const cost = purchase + transport + other;
    const profit = revenue - cost;
    const margin = revenue ? (profit / revenue) * 100 : 0;
    return { purchase, transport, cost, revenue, profit, margin };
  }, [qty, buy, sell, logistics, extra, product?.price]);

  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink">Foyda kalkulyatori</h2>
          <p className="text-[13px] text-muted">Taxminiy hisob. Bu rasmiy moliyaviy hisobot emas.</p>
        </div>
        <span className="rounded-full bg-soft px-3 py-1 text-[12px] font-semibold text-accent">Premium</span>
      </div>
      {!premium ? (
        <button type="button" onClick={onLock} className="min-h-11 rounded-[6px] bg-accent px-4 text-sm font-semibold text-on-accent">
          Premiumda ochish
        </button>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-3">
            <Select aria-label="Mahsulot" value={productId} onChange={setProductId} options={products.map((item) => ({ value: item.id, label: item.name }))} />
            <label className="grid gap-1 text-[13px] text-muted">Miqdor (kg)<input className="h-11 rounded-[6px] border border-line px-3 text-sm text-ink" value={qty} onChange={(e) => setQty(e.target.value)} /></label>
            <label className="grid gap-1 text-[13px] text-muted">Xarid narxi<input className="h-11 rounded-[6px] border border-line px-3 text-sm text-ink" value={buy} placeholder={String(Math.round(product?.price || 0))} onChange={(e) => setBuy(e.target.value)} /></label>
            <label className="grid gap-1 text-[13px] text-muted">Sotish narxi<input className="h-11 rounded-[6px] border border-line px-3 text-sm text-ink" value={sell} onChange={(e) => setSell(e.target.value)} /></label>
            <label className="grid gap-1 text-[13px] text-muted">Logistika<input className="h-11 rounded-[6px] border border-line px-3 text-sm text-ink" value={logistics} onChange={(e) => setLogistics(e.target.value)} /></label>
            <label className="grid gap-1 text-[13px] text-muted">Qo'shimcha xarajat<input className="h-11 rounded-[6px] border border-line px-3 text-sm text-ink" value={extra} onChange={(e) => setExtra(e.target.value)} /></label>
          </div>
          <dl className="grid gap-2 self-start rounded-[10px] bg-subtle p-4 text-sm">
            <div className="flex justify-between"><dt>Xarid</dt><dd className="tabular font-semibold">{formatPrice(result.purchase)} so'm</dd></div>
            <div className="flex justify-between"><dt>Logistika</dt><dd className="tabular font-semibold">{formatPrice(result.transport)} so'm</dd></div>
            <div className="flex justify-between"><dt>Jami xarajat</dt><dd className="tabular font-semibold">{formatPrice(result.cost)} so'm</dd></div>
            <div className="flex justify-between"><dt>Tushum</dt><dd className="tabular font-semibold">{formatPrice(result.revenue)} so'm</dd></div>
            <div className="flex justify-between text-base"><dt>Taxminiy foyda</dt><dd className="tabular font-semibold text-ask">{formatPrice(result.profit)} so'm</dd></div>
            <div className="flex justify-between"><dt>Marja</dt><dd className="tabular font-semibold">{result.margin.toFixed(1)}%</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
