import { CheckCircle, Clock, Package } from "lucide-react";
import type { OrderStatus } from "./types";

const STYLES: Record<OrderStatus, string> = {
  Yangi: "bg-[#FEF6E7] text-[#F79009]",
  Tasdiqlangan: "bg-[#EAF8F0] text-[#087A45]",
  Yetkazilmoqda: "bg-[#E8F3FF] text-[#2E90FA]",
  Yakunlangan: "bg-[#F2F4F7] text-[#667085]",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const Icon = status === "Yakunlangan" ? CheckCircle : status === "Yangi" ? Clock : Package;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}>
      <Icon size={12} strokeWidth={2} />
      {status}
    </span>
  );
}
