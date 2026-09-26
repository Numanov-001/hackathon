import { useState } from "react";
import { ImagePlus, RotateCcw, Shield } from "lucide-react";
import { fileToSafeDataUrl } from "./lib/safe";
import type { Product } from "./types";

type AdminPanelProps = {
  products: Product[];
  unlocked: boolean;
  onUnlock: (ok: boolean) => void;
  onUpload: (id: string, file: File) => Promise<void>;
  onReset: (id: string) => void;
  onError: (message: string) => void;
};

export default function AdminPanel({ products, unlocked, onUnlock, onUpload, onReset, onError }: AdminPanelProps) {
  const [pin, setPin] = useState("");
  const expected = import.meta.env.VITE_ADMIN_PIN || (import.meta.env.DEV ? "bozor-admin" : "");

  function submitPin() {
    if (!expected || pin !== expected) {
      onError("Admin kaliti noto‘g‘ri.");
      onUnlock(false);
      return;
    }
    onUnlock(true);
    setPin("");
  }

  async function readFile(id: string, file: File | undefined) {
    if (!file || !unlocked) return;
    const dataUrl = await fileToSafeDataUrl(file);
    if (!dataUrl) {
      onError("Faqat JPG, PNG yoki WEBP, 900 KB gacha. SVG qabul qilinmaydi.");
      return;
    }
    await onUpload(id, file);
  }

  return (
    <section className="col-span-12 rounded-2xl border border-[#E4E7EC] bg-white/92 p-6 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
      <div className="mb-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2E90FA]">
          <Shield size={14} /> Admin
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#14213D]">Mahsulot rasmlari</h2>
        <p className="mt-1 text-sm text-[#667085]">Rasmlar faqat shu qurilmada. Admin kalitisiz o‘zgartirib bo‘lmaydi.</p>
      </div>
      {!unlocked && (
        <form
          className="mb-6 flex flex-wrap items-end gap-3"
          onSubmit={(event) => { event.preventDefault(); submitPin(); }}
        >
          <label className="grid min-w-56 flex-1 gap-1.5 text-sm font-medium">
            Admin kaliti
            <input
              type="password"
              autoComplete="current-password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className="h-12 rounded-[10px] border border-[#E4E7EC] px-3 text-sm outline-none focus:border-[#16A05D] focus:ring-[3px] focus:ring-[#16A05D]/12"
            />
          </label>
          <button type="submit" className="h-12 rounded-[10px] bg-[#16A05D] px-5 text-sm font-semibold text-white hover:bg-[#087A45]">
            Kirish
          </button>
        </form>
      )}
      {unlocked && (
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
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      void readFile(product.id, event.target.files?.[0]);
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
      )}
    </section>
  );
}
