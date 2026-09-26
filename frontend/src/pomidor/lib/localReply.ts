import type { MarketSnapshot } from "./marketSnapshot";

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

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

function analyze(snap: MarketSnapshot | null) {
  if (!snap) return null;
  const prices = snap.series.map((row) => row.price).filter((n) => n > 0);
  const last = prices.at(-1) ?? snap.price;
  const prev = prices.at(-2) ?? last;
  const lastChange = prev ? Number((((last - prev) / prev) * 100).toFixed(1)) : snap.change;
  return { name: snap.productName, unit: snap.unit, last, lastChange };
}

export function localMarketReply(question: string, snap: MarketSnapshot | null) {
  const q = question.trim().toLowerCase();
  if (isGreeting(question)) {
    return "Assalomu alaykum. Pomidor yordamchisi. Bozor narxi, grafik yoki P2P haqida qisqa so'rang.";
  }
  if (/rahmat|tashakkur|thanks|thank you/.test(q)) {
    return "Arzimaydi. Yana savol bo'lsa, yozing.";
  }
  if (/ob[- ]?havo|dasturlash|siyosat|bitcoin|kripto|python|javascript|futbol/.test(q)) {
    return "Bu mavzu saytdan tashqari. Bozor, narx yoki P2P haqida so'rang.";
  }
  if (/p2p|e['']lon|escrow/.test(q) && !/narx|osh|tush|trend/.test(q)) {
    return "P2P — sotib olish va sotish e'lonlari. Bu yopilgan savdo emas. Filtr: mahsulot, hudud, to'lov.";
  }
  if (/obuna|plus|pro|clerk|kirish|profil/.test(q) && !/narx|osh|tush/.test(q)) {
    return "Kirish Clerk orqali. Keyin Obuna, Profil va shu yordamchi ochiladi.";
  }
  const a = analyze(snap);
  if (!a) {
    return "Chapdan tovar tanlang. Men shu saytdagi 24 oylik demo narxni qisqa aytaman.";
  }
  const move = a.lastChange > 0.3 ? "oshgan" : a.lastChange < -0.3 ? "tushgan" : "deyarli o'zgarmagan";
  return `${a.name} hozir ${a.last} UZS/${a.unit}. Oxirgi oy ${signed(a.lastChange)} — ${move}. Bu demo oylik o'rtacha, jonli birja emas.`;
}
