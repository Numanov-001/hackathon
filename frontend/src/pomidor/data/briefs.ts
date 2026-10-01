import type { Product, ProductCategory, ProductUnit } from "../types";

const UNIT_PHRASE: Record<ProductUnit, string> = {
  kg: "1 kg",
  m: "1 metr",
  qop: "1 qop",
};

const CATEGORY_BLURB: Record<ProductCategory, string> = {
  sabzavot:
    "Chiziq — oylik o‘rtacha narx. Dehqon bozori kabi: yozda arzon, qishda issiqxona tufayli qimmat.",
  meva:
    "Chiziq — oylik o‘rtacha. Meva uchun rasmiy SIAT 1308 qatori bo‘lsa, narx shu yerda chiqadi.",
  don:
    "Chiziq — don mahsulotlari uchun oylik o‘rtacha. Un qopda, guruch kilogrammda.",
  truba:
    "Chiziq — 1 metr uchun oylik o‘rtacha. Qurilish ketganda ko‘tariladi. Optom hisob metrda.",
  optom:
    "Chiziq — optom oylik o‘rtacha. Ombor aylanmasi: un qopda, yog‘ kilogrammda.",
};

export function unitPhrase(unit: ProductUnit) {
  return UNIT_PHRASE[unit];
}

export function chartBlurb(product: Product) {
  if (product.id === "un") {
    return "Chiziq — 1 qop un uchun oylik o‘rtacha. Do‘konda qop so‘rashadi, kg emas.";
  }
  return CATEGORY_BLURB[product.category];
}

export function monthMove(product: Product) {
  return product.change >= 0 ? "o‘tgan oyga qaraganda qimmatroq" : "o‘tgan oyga qaraganda arzonroq";
}
