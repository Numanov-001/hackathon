import type { MarketSnapshot } from "./marketSnapshot";

function signed(n: number) {
  const abs = Math.abs(n).toFixed(1);
  if (n > 0) return `+${abs}%`;
  if (n < 0) return `-${abs}%`;
  return "0%";
}

export function isGreeting(question: string) {
  const q = question.trim().toLowerCase();
  return /^(salom+|assalomu?\s*alaykum|assalom|hi+|hello|hey|qalaysiz|qalay)\b/.test(q) && q.length < 48;
}

export function askedAboutMarket(question: string) {
  const q = question.trim().toLowerCase();
  return /narx|foiz|%|osh|tush|trend|202[4-9]|grafik|qancha|necha|pomidor|kartoshka|piyoz|bodring|truba|un\b|yog|guruch|p2p|e['']lon|obuna|kirish|profil/.test(q);
}

function analyze(snap: MarketSnapshot | null) {
  if (!snap) return null;
  const prices = snap.series.map((row) => row.price).filter((n) => n > 0);
  const last = prices.at(-1) ?? snap.price;
  const prev = prices.at(-2) ?? last;
  const lastChange = prev ? Number((((last - prev) / prev) * 100).toFixed(1)) : snap.change;
  return { name: snap.productName, unit: snap.unit, last, lastChange };
}

const HELLO = "Assalomu alaykum. Nima xizmat?";

export function localMarketReply(question: string, snap: MarketSnapshot | null) {
  const q = question.trim().toLowerCase();
  if (isGreeting(question)) return HELLO;
  if (/rahmat|tashakkur|thanks|thank you/.test(q)) return "Arzimaydi. Yana savol bo'lsa, yozing.";
  if (/ob[- ]?havo|dasturlash|siyosat|bitcoin|kripto|python|javascript|futbol/.test(q)) {
    return "Bu sayt mavzusi emas. Nima xizmat — bozor, narx yoki P2P?";
  }
  if (!askedAboutMarket(question)) return HELLO;

  if (/2027/.test(q)) {
    return "2027 uchun saytda qator yo'q. Demo 2026-sentyabrgacha. Shu davrni aytaymi?";
  }
  if (/p2p|e['']lon|escrow/.test(q) && !/narx|osh|tush|trend/.test(q)) {
    return "P2P — sotib olish va sotish e'lonlari, arzonidan qimmatiga. Telefon Starter tarifida ochiladi. Yopilgan savdo emas.";
  }
  if (/obuna|plus|pro|clerk|kirish|profil/.test(q) && !/narx|osh|tush/.test(q)) {
    return "Kirish Clerk orqali. Bepul tarifda telefon yopiq. Starter 199 000 so'm/oy — telefon va e'lon. Business 299 000 so'm/oy — eng arzon taklif tavsiyasi. Custom kelishuv bilan, o'zi ochilmaydi.";
  }

  const a = analyze(snap);
  if (!a) return "Chapdan tovar tanlang, keyin narxini so'rang.";
  const move = a.lastChange > 0.3 ? "oshgan" : a.lastChange < -0.3 ? "tushgan" : "deyarli o'zgarmagan";
  return `${a.name} hozir ${a.last} UZS/${a.unit}. Oxirgi oy ${signed(a.lastChange)} — ${move}. Demo oylik o'rtacha, jonli birja emas.`;
}
