import { Minus, Plus } from "lucide-react";

type QuantityInputProps = {
  value: number;
  onChange: (next: number) => void;
};

export default function QuantityInput({ value, onChange }: QuantityInputProps) {
  return (
    <div className="flex h-12 items-center overflow-hidden rounded-[10px] border border-[#D0D5DD] bg-white focus-within:border-[#16A05D] focus-within:ring-[3px] focus-within:ring-[#16A05D]/12">
      <button
        type="button"
        aria-label="Kamaytirish"
        className="grid h-full w-12 place-items-center text-[#667085] transition-all duration-150 ease-linear hover:bg-[#EAF8F0] hover:text-[#087A45]"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus size={16} strokeWidth={2} />
      </button>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))}
        className="h-full min-w-0 flex-1 border-x border-[#E4E7EC] text-center text-sm font-semibold text-[#14213D] outline-none"
      />
      <button
        type="button"
        aria-label="Oshirish"
        className="grid h-full w-12 place-items-center text-[#667085] transition-all duration-150 ease-linear hover:bg-[#EAF8F0] hover:text-[#087A45]"
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
