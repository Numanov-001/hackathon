import { useEffect, useState } from "react";
import Select from "./Select";
import { SIAT_CROP_IDS } from "./data/siat1308";
import type { Product } from "./types";

type AlertRule = {
  id: string;
  productId: string;
  kind: "above" | "below" | "change";
  value: number;
};

type PriceAlertsProps = {
  products: Product[];
  premium: boolean;
  onLock: () => void;
};

const KEY = "marketch-alerts";

function load(): AlertRule[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AlertRule[]) : [];
  } catch {
    return [];
  }
}

export default function PriceAlerts({ products, premium, onLock }: PriceAlertsProps) {
  const crops = products.filter((item) => SIAT_CROP_IDS.includes(item.id as (typeof SIAT_CROP_IDS)[number]));
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [productId, setProductId] = useState(crops[0]?.id ?? "pomidor");
  const [kind, setKind] = useState<AlertRule["kind"]>("above");
  const [value, setValue] = useState("8000");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setRules(load());
  }, []);

  useEffect(() => {
    const hit = rules.find((rule) => {
      const product = products.find((item) => item.id === rule.productId);
      if (!product || product.price <= 0) return false;
      if (rule.kind === "above") return product.price >= rule.value;
      if (rule.kind === "below") return product.price <= rule.value;
      return Math.abs(product.changePercent ?? product.change) >= rule.value;
    });
    if (hit) {
      const product = products.find((item) => item.id === hit.productId);
      setNotice(`🔔 ${product?.name} narxi shartga yetdi.`);
    }
  }, [products, rules]);

  function add() {
    if (!premium) {
      onLock();
      return;
    }
    const next = [...rules, { id: String(Date.now()), productId, kind, value: Number(value) || 0 }];
    setRules(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  return (
    <section className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink">Narx alertlari</h2>
          <p className="text-[13px] text-muted">Telegram keyin ulanadi. Hozircha brauzerda saqlanadi.</p>
        </div>
        <span className="rounded-full bg-soft px-3 py-1 text-[12px] font-semibold text-accent">Premium</span>
      </div>
      {notice && <p className="mb-3 rounded-[8px] bg-soft px-3 py-2 text-sm text-accent">{notice}</p>}
      <div className="grid gap-3 sm:grid-cols-4">
        <Select aria-label="Mahsulot" value={productId} onChange={setProductId} options={crops.map((item) => ({ value: item.id, label: item.name }))} />
        <Select aria-label="Shart" value={kind} onChange={(next) => setKind(next as AlertRule["kind"])} options={[{ value: "above", label: "Narx oshsa" }, { value: "below", label: "Narx tushsa" }, { value: "change", label: "% o‘zgarish" }]} />
        <input className="h-11 rounded-[6px] border border-line px-3 text-sm" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Qiymat" />
        <button type="button" onClick={add} className="min-h-11 rounded-[6px] bg-accent px-3 text-sm font-semibold text-on-accent">Qo‘shish</button>
      </div>
      <ul className="mt-3 grid gap-2 text-sm">
        {rules.map((rule) => {
          const name = products.find((item) => item.id === rule.productId)?.name ?? rule.productId;
          return (
            <li key={rule.id} className="rounded-[8px] bg-subtle px-3 py-2 text-muted">
              {name}: {rule.kind === "above" ? "oshsa" : rule.kind === "below" ? "tushsa" : "%"} {rule.value}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
