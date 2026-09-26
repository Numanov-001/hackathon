import type { MarketSnapshot } from "./marketSnapshot";

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function signed(n: number) {
  const abs = Math.abs(n).toFixed(1);
  if (n > 0) return `+${abs}%`;
  if (n < 0) return `−${abs}%`;
  return "0.0%";
}

function analyze(snap: MarketSnapshot | null) {
  if (!snap) return null;
  const prices = snap.series.map((row) => row.price).filter((n) => n > 0);
  const months = snap.series.map((row) => row.month);
  const last = prices.at(-1) ?? snap.price;
  const prev = prices.at(-2) ?? last;
  const first = prices[0] ?? last;
  const lastChange = prev ? Number((((last - prev) / prev) * 100).toFixed(1)) : snap.change;
  const span = first ? Number((((last - first) / first) * 100).toFixed(1)) : 0;
  const third = Math.max(1, Math.floor(prices.length / 3));
  const early = avg(prices.slice(0, third));
  const late = avg(prices.slice(-third));
  let trend = "barqaror";
  if (late > early * 1.03) trend = "o'sish";
  else if (late < early * 0.97) trend = "pasayish";
  let minI = 0;
  let maxI = 0;
  prices.forEach((price, index) => {
    if (price < prices[minI]) minI = index;
    if (price > prices[maxI]) maxI = index;
  });
  return {
    productName: snap.productName,
    unit: snap.unit,
    last,
    lastMonth: months.at(-1) || "",
    lastChange,
    trend,
    span,
    early: Math.round(early || last),
    late: Math.round(late || last),
    lowMonth: months[minI] || "",
    highMonth: months[maxI] || "",
  };
}

export function localMarketReply(question: string, snap: MarketSnapshot | null) {
  const a = analyze(snap);
  const q = question.toLowerCase();
  if (/ob[- ]?havo|dasturlash|siyosat|bitcoin|kripto|python|javascript/.test(q)) {
    return "Bu savol sayt tahliliga tegishli emas. Bozor grafigi yoki P2P haqida so‘rang.";
  }
  if (/^(hi|hello|hey|salom|assalomu|qalaysiz)\b/.test(q)) {
    if (!a) return "Salom. Chapdan tovar tanlang — 24 oylik demo qator bo‘yicha trendini aytaman.";
  }
  if (/p2p|e[’']lon|escrow/.test(q) && !/narx|osh|tush|trend/.test(q)) {
    return "P2P — sotib olish va sotish e’lonlari (niyat). Bu yopilgan savdo emas. Filtr: mahsulot, hudud, to‘lov.";
  }
  if (/obuna|plus|pro|clerk|kirish|profil/.test(q) && !/narx|osh|tush/.test(q)) {
    return "Kirish Clerk orqali. Keyin Obuna, Profil va shu yordamchi ochiladi. Rejalar demo.";
  }
  if (!a) {
    return "Saytda 24 oylik demo oylik o‘rtacha ko‘rsatiladi, jonli birja emas. Chapdan tovar tanlang.";
  }
  const lastWord =
    a.lastChange > 0.3 ? "oxirgi oyda oshgan" : a.lastChange < -0.3 ? "oxirgi oyda tushgan" : "oxirgi oyda deyarli o‘zgarmagan";
  const trendWord =
    a.trend === "o'sish" ? "umumiy trend yuqoriga" : a.trend === "pasayish" ? "umumiy trend pastga" : "trend barqaror";
  return [
    `${a.productName}: ${a.last} UZS/${a.unit}, oxirgi oy ${signed(a.lastChange)} — ${lastWord}.`,
    `Qator (24 oy demo): erta ~${a.early}, oxirgi ~${a.late} (${trendWord}); butun davr ${signed(a.span)}.`,
    `Mavsum: past ${a.lowMonth}, yuqori ${a.highMonth}. Bu mock oylik o‘rtacha, jonli birja emas.`,
  ].join(" ");
}
