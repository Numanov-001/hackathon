import { TrendingDown, TrendingUp } from "lucide-react";
import { CATEGORY_LABEL } from "./data/catalog";
import MiniSpark from "./MiniSpark";
import ProductMark from "./ProductMark";
import { formatPrice, signedPct } from "./lib/format";
import { tickerOf } from "./lib/ticker";
import { priceUnit } from "./lib/unit";
import type { Product } from "./types";

type ProductTableProps = {
  products: Product[];
  onSelect: (id: string) => void;
};

export default function ProductTable({ products, onSelect }: ProductTableProps) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <h1 className="text-xl font-semibold text-ink">Mahsulotlar</h1>
        <p className="text-[13px] text-muted">24 oy oylik o‘rtacha. Qatorni bosing — grafik ochiladi.</p>
      </div>
      <ul className="divide-y divide-line md:hidden">
        {products.map((product) => {
          const up = product.change >= 0;
          return (
            <li key={product.id}>
              <button type="button" onClick={() => onSelect(product.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <ProductMark name={product.name} image={product.image} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
                  <span className="block text-[13px] text-muted">{CATEGORY_LABEL[product.category]}</span>
                </span>
                <span className="text-right">
                  <span className="tabular block text-sm font-semibold text-ink">{formatPrice(product.price)}</span>
                  <span className={`tabular inline-flex items-center gap-1 text-[13px] font-semibold ${up ? "text-ask" : "text-bid"}`}>
                    {up ? <TrendingUp size={14} strokeWidth={1.8} aria-hidden="true" /> : <TrendingDown size={14} strokeWidth={1.8} aria-hidden="true" />}
                    {signedPct(product.change)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-subtle text-[13px] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Tovar</th>
              <th className="px-4 py-3 font-medium">Turkum</th>
              <th className="px-4 py-3 font-medium">Kod</th>
              <th className="px-4 py-3 font-medium">Narx</th>
              <th className="px-4 py-3 font-medium">O‘zgarish</th>
              <th className="px-4 py-3 font-medium">24 oy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => {
              const up = product.change >= 0;
              return (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onSelect(product.id)} className="inline-flex items-center gap-3 text-sm font-medium text-ink hover:underline">
                      <ProductMark name={product.name} image={product.image} />
                      {product.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted">{CATEGORY_LABEL[product.category]}</td>
                  <td className="px-4 py-3 text-[13px] text-muted">{tickerOf(product.id)}</td>
                  <td className="tabular px-4 py-3 text-sm font-semibold text-ink">{formatPrice(product.price)} <span className="font-medium text-muted">{priceUnit(product.unit)}</span></td>
                  <td className={`tabular px-4 py-3 text-sm font-semibold ${up ? "text-ask" : "text-bid"}`}>
                    <span className="inline-flex items-center gap-1">
                      {up ? <TrendingUp size={14} strokeWidth={1.8} aria-hidden="true" /> : <TrendingDown size={14} strokeWidth={1.8} aria-hidden="true" />}
                      {signedPct(product.change)}
                    </span>
                  </td>
                  <td className="w-40 px-4 py-3">
                    <MiniSpark data={product.chartData} up={up} label={product.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
