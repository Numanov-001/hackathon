import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "./lib/cn";
import type { Product } from "./types";

type NotificationsProps = {
  products: Product[];
  enabled: boolean;
  onOpenProduct: (id: string) => void;
};

export default function Notifications({ products, enabled, onOpenProduct }: NotificationsProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const movers = enabled ? products.filter((item) => Math.abs(item.change) >= 10) : [];

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Bildirishnomalar"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-[#E4E7EC] text-[#667085] transition-all duration-150 hover:bg-[#EAF8F0] hover:text-[#087A45]"
      >
        <Bell size={18} strokeWidth={1.8} />
        {movers.length > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#16A05D]" />
        )}
      </button>
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-2xl border border-[#E4E7EC] bg-white p-3 shadow-[0_16px_40px_rgba(16,24,40,0.12)] transition-all duration-200",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <p className="px-1 text-sm font-semibold text-[#14213D]">Bildirishnomalar</p>
        {movers.length === 0 ? (
          <p className="mt-3 px-1 text-sm text-[#667085]">Hozircha katta narx o‘zgarishi yo‘q.</p>
        ) : (
          <ul className="mt-2 grid gap-1">
            {movers.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => { onOpenProduct(item.id); setOpen(false); }}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm hover:bg-[#F5FBF7]"
                >
                  <span>{item.name}</span>
                  <span className={item.change >= 0 ? "font-semibold text-[#16A05D]" : "font-semibold text-[#F04438]"}>
                    {item.change > 0 ? "+" : ""}{item.change}%
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
