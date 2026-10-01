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
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
};

export default function ProductTable({ products, onSelect, loading, error, onRetry }: ProductTableProps) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <h1 className="text-xl font-semibold text-ink">Mahsulotlar</h1>
        <p className="text-[13px] text-muted">SIAT 1308 oylik o‘rtacha. Qatorni bosing — grafik ochiladi.</p>
      </div>
      {loading && (
        <p className="border-b border-line px-4 py-3 text-sm text-muted" role="status" aria-live="polite">SIAT narxlari yuklanmoqda…</p>
      )}
      {error && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3" role="alert">
          <p className="text-sm text-bid">{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="min-h-10 rounded-[6px] bg-accent px-3 text-[13px] font-semibold text-on-accent">
              Qayta urinish
            </button>
          )}
        </div>
      )}
      <ul className="divide-y divide-line md:hidden">
        {products.map((product) => {
          const up = product.change >= 0;
          return (
            <li key={product.id}>
              <button type="button" onClick={() => onSelect(product.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <ProductMark name={product.name} image={product.image} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
                  <span className="block text-[13px] text-muted">{CATEGORY_LABEL[product.category]}{product.month ? ` · ${product.month}` : ""}</span>
                </span>
                <span className="text-right">
                  <span className="tabular block text-sm font-semibold text-ink">{product.price > 0 ? formatPrice(product.price) : loading ? "…" : "—"}</span>
                  <span className={`tabular inline-flex items-center gap-1 text-[13px] font-semibold ${product.price > 0 ? (up ? "text-ask" : "text-bid") : "text-muted"}`}>
                    {product.price > 0 ? (
                      <>
                        {up ? <TrendingUp size={14} strokeWidth={1.8} aria-hidden="true" /> : <TrendingDown size={14} strokeWidth={1.8} aria-hidden="true" />}
                        {signedPct(product.changePercent ?? product.change)}
                      </>
                    ) : "—"}
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
              <th className="px-4 py-3 font-medium">Oldingi</th>
              <th className="px-4 py-3 font-medium">O‘zgarish</th>
              <th className="px-4 py-3 font-medium">Oy</th>
              <th className="px-4 py-3 font-medium">Amal</th>
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
                  <td className="tabular px-4 py-3 text-sm font-semibold text-ink">{product.price > 0 ? formatPrice(product.price) : loading ? "…" : "—"} <span className="font-medium text-muted">{priceUnit(product.unit)}</span></td>
                  <td className="tabular px-4 py-3 text-[13px] text-muted">{product.previousPrice ? formatPrice(product.previousPrice) : "—"}</td>
                  <td className={`tabular px-4 py-3 text-sm font-semibold ${product.price > 0 ? (up ? "text-ask" : "text-bid") : "text-muted"}`}>
                    <span className="inline-flex items-center gap-1">
                      {product.price > 0 ? (
                        <>
                          {up ? <TrendingUp size={14} strokeWidth={1.8} aria-hidden="true" /> : <TrendingDown size={14} strokeWidth={1.8} aria-hidden="true" />}
                          {signedPct(product.changePercent ?? product.change)}
                        </>
                      ) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted">{product.month || "—"}</td>
                  <td className="w-40 px-4 py-3">
                    <MiniSpark data={product.chartData} up={up} label={product.id} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted">
                    Narx tarixi · P2P · Alert · Prognoz
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
