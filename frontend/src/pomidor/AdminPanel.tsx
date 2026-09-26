import { ImagePlus, RotateCcw, Shield } from "lucide-react";
import type { Product } from "./types";

type AdminPanelProps = {
  products: Product[];
  onImage: (id: string, dataUrl: string) => void;
  onReset: (id: string) => void;
};

export default function AdminPanel({ products, onImage, onReset }: AdminPanelProps) {
  function readFile(id: string, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 900_000) {
      window.alert("Rasm 900 KB dan kichik bo‘lsin. Keyinroq Supabase Storage katta fayllarni oladi.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onImage(id, reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="col-span-12 rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2E90FA]">
            <Shield size={14} /> Admin
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#14213D]">Mahsulot rasmlari</h2>
          <p className="mt-1 text-sm text-[#667085]">Hozircha rasmlar qurilmada saqlanadi. Keyin Supabase Storage ga ulaymiz.</p>
        </div>
      </div>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="rounded-2xl border border-[#E4E7EC] p-4">
            <div className="flex items-center gap-3">
              <img src={product.image} alt="" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-[#E4E7EC]" />
              <div>
                <p className="font-semibold text-[#14213D]">{product.name}</p>
                <p className="text-xs text-[#667085]">{product.id}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-[#16A05D] px-3 text-sm font-semibold text-white hover:bg-[#087A45]">
                <ImagePlus size={16} strokeWidth={1.8} />
                Rasm qo‘shish
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    readFile(product.id, event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => onReset(product.id)}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#E4E7EC] px-3 text-sm font-semibold text-[#14213D] hover:bg-[#F5FBF7]"
              >
                <RotateCcw size={16} strokeWidth={1.8} />
                Qaytarish
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
