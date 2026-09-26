import ProductList from "./ProductList";
import type { Product } from "./types";

type SidebarProps = {
  products: Product[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAll: () => void;
};

export default function Sidebar(props: SidebarProps) {
  return <ProductList {...props} />;
}
