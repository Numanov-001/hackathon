import { ChevronRight, Leaf } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "./types";

type ProductListProps = {
  products: Product[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAll: () => void;
};

export default function ProductList({ products, selectedId, onSelect, onAll }: ProductListProps) {
  return (
    <aside className="flex h-full min-h-[720px] flex-col rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold text-[#14213D]">
          <Leaf size={16} strokeWidth={1.8} className="text-[#16A05D]" />
          Mahsulotlar
        </h2>
        <button type="button" onClick={onAll} className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#087A45] transition-all duration-150 hover:underline">
          Barchasi
          <ChevronRight size={14} strokeWidth={1.8} />
        </button>
      </div>
      <div className="grid flex-1 content-start gap-2 md:grid-cols-2 lg:grid-cols-1">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} selected={product.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </aside>
  );
}
