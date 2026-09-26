import { TrendingDown, TrendingUp } from "lucide-react";
import { formatPrice, signedPct } from "./lib/format";
import { cn } from "./lib/cn";
import type { Product } from "./types";

type ProductCardProps = {
  product: Product;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function ProductCard({ product, selected, onSelect }: ProductCardProps) {
  const up = product.change >= 0;
  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      aria-current={selected}
      className={cn(
        "flex h-[58px] w-full items-center gap-3 rounded-xl px-3 transition-all duration-150 ease-linear",
        selected ? "bg-[#EAF8F0] ring-1 ring-[#16A05D]/25" : "hover:bg-[#F5FBF7]",
      )}
    >
      <img src={product.image} alt="" className="h-11 w-11 rounded-full object-cover" />
      <span className="min-w-0 flex-1 text-left text-sm font-medium text-[#14213D]">{product.name}</span>
      <span className="text-sm font-semibold text-[#14213D]">{formatPrice(product.price)}</span>
      <span className={cn("inline-flex min-w-[72px] items-center justify-end gap-0.5 text-xs font-semibold", up ? "text-[#16A05D]" : "text-[#F04438]")}>
        {up ? <TrendingUp size={12} strokeWidth={2} /> : <TrendingDown size={12} strokeWidth={2} />}
        {signedPct(product.change)}
      </span>
    </button>
  );
}
