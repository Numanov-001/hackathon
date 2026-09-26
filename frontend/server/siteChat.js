export const SYSTEM_PROMPT = `Siz Pomidor yordamchisisiz. Har doim odobli. Salomga FAQAT: "Assalomu alaykum. Nima xizmat?" — raqam, pomidor, trend YOZILMASIN.

Raqam/foiz/2027 ni faqat foydalanuvchi o'zi so'rasa ayt. 2027 qatori yo'q (demo 2026-sengacha). 1–2 gap. Mavzudan chiqma. Sotib ol dema.`;

const MAX_TURNS = 12;
const MAX_CHARS = 500;

const MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
  "llama-3.3-70b-versatile",
];

function asNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asText(value, max) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function signed(n) {
  const abs = Math.abs(n).toFixed(1);
  if (n > 0) return `+${abs}%`;
  if (n < 0) return `−${abs}%`;
  return "0.0%";
}

export function sanitizeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .slice(-MAX_TURNS)
    .map((item) => ({
      role: item.role,
      content: item.content.replace(/[<>]/g, "").trim().slice(0, MAX_CHARS),
    }))
    .filter((item) => item.content);
}

export function sanitizeSnapshot(raw) {
  if (!raw || typeof raw !== "object") return null;
  const seriesIn = Array.isArray(raw.series) ? raw.series : [];
  const series = seriesIn
    .slice(-24)
    .map((row) => ({
      month: asText(row?.month || row?.date, 10),
      price: Math.round(asNum(row?.price)),
    }))
    .filter((row) => row.month && row.price > 0);
  if (!asText(raw.productName, 40) && !series.length) return null;
  return {
    productId: asText(raw.productId, 32),
    productName: asText(raw.productName, 40) || "Tovar",
    price: Math.round(asNum(raw.price)),
    change: Number(asNum(raw.change).toFixed(1)),
    unit: asText(raw.unit, 8) || "kg",
    series,
    basketChange: raw.basketChange == null ? null : Number(asNum(raw.basketChange).toFixed(1)),
    topUpName: asText(raw.topUpName, 40),
    topUpChange: raw.topUpChange == null ? null : Number(asNum(raw.topUpChange).toFixed(1)),
    topDownName: asText(raw.topDownName, 40),
    topDownChange: raw.topDownChange == null ? null : Number(asNum(raw.topDownChange).toFixed(1)),
  };
}

export function analyzeSnapshot(snap) {
  if (!snap) return null;
  const prices = (snap.series || []).map((row) => row.price).filter((n) => n > 0);
  const months = (snap.series || []).map((row) => row.month);
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
    lowPrice: prices[minI] ?? last,
    highMonth: months[maxI] || "",
    highPrice: prices[maxI] ?? last,
    basketChange: snap.basketChange,
    topUpName: snap.topUpName,
    topUpChange: snap.topUpChange,
    topDownName: snap.topDownName,
    topDownChange: snap.topDownChange,
    points: prices.length,
  };
}

export function analysisBlock(snap) {
  const a = analyzeSnapshot(snap);
  if (!a) return "Bozor qatori yo‘q. Faqat demo haqida gapiring, raqam o‘ylab topmang.";
  const extra = [
    a.basketChange == null ? "" : `Savat oxirgi oy: ${signed(a.basketChange)}.`,
    a.topUpName ? `TOP+: ${a.topUpName} ${signed(a.topUpChange ?? 0)}.` : "",
    a.topDownName ? `TOP−: ${a.topDownName} ${signed(a.topDownChange ?? 0)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return [
    "HOZIRGI EKRAN TAHLILI (demo oylik o‘rtacha, jonli emas):",
    `${a.productName}: oxirgi oy ${a.lastMonth || "—"} = ${a.last} UZS/${a.unit}, oyma-oy ${signed(a.lastChange)}.`,
    `Trend (${a.points} nuqta): erta oylar ~${a.early}, oxirgi oylar ~${a.late} → ${a.trend}. Butun qator: ${signed(a.span)}.`,
    `Mavsum: eng past ${a.lowMonth} (${a.lowPrice}), eng yuqori ${a.highMonth} (${a.highPrice}).`,
    extra,
  ]
    .filter(Boolean)
    .join("\n");
}

function isGreeting(question) {
  const q = String(question || "").trim().toLowerCase();
  return /^(salom+|assalomu?\s*alaykum|assalom|hi+|hello|hey|qalaysiz|qalay)\b/.test(q) && q.length < 48;
}

function askedAboutMarket(question) {
  const q = String(question || "").trim().toLowerCase();
  return /narx|foiz|%|osh|tush|trend|202[4-9]|grafik|qancha|necha|pomidor|kartoshka|piyoz|bodring|truba|un\b|yog|guruch|p2p|e['']lon|obuna|kirish|profil/.test(q);
}

export function localMarketReply(question, snap) {
  const q = String(question || "").trim().toLowerCase();
  if (/rahmat|tashakkur|thanks|thank you/.test(q)) return "Arzimaydi. Yana savol bo'lsa, yozing.";
  if (isGreeting(question) || !askedAboutMarket(question)) return "Assalomu alaykum. Nima xizmat?";
  if (/2027/.test(q)) return "2027 uchun saytda qator yo'q. Demo 2026-sentyabrgacha. Shu davrni aytaymi?";
  if (/ob[- ]?havo|dasturlash|siyosat|bitcoin|kripto|python|javascript|futbol/.test(q)) {
    return "Bu sayt mavzusi emas. Nima xizmat — bozor, narx yoki P2P?";
  }
  const a = analyzeSnapshot(snap);
  if (/p2p|e['']lon|sotib|sotish|escrow/.test(q) && !/narx|osh|tush|trend|pomidor|kartoshka/.test(q)) {
    return "P2P — sotib olish va sotish e'lonlari. Bu yopilgan savdo emas.";
  }
  if (/obuna|plus|pro|clerk|kirish|profil/.test(q) && !/narx|osh|tush/.test(q)) {
    return "Kirish Clerk orqali. Keyin Obuna va Profil ochiladi.";
  }
  if (!a) return "Chapdan tovar tanlang, keyin narxini so'rang.";
  const lastWord =
    a.lastChange > 0.3 ? "oshgan" : a.lastChange < -0.3 ? "tushgan" : "deyarli o'zgarmagan";
  return `${a.productName} hozir ${a.last} UZS/${a.unit}. Oxirgi oy ${signed(a.lastChange)} — ${lastWord}. Demo oylik o'rtacha, jonli birja emas.`;
}

export async function groqReply(apiKey, messages, snap) {
  const extra = analysisBlock(snap);
  const models = [process.env.GROQ_MODEL, ...MODELS].filter(Boolean);
  const seen = new Set();
  let lastStatus = 0;
  for (const model of models) {
    if (seen.has(model)) continue;
    seen.add(model);
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 380,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: extra },
          ...messages,
        ],
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const text = String(data.choices?.[0]?.message?.content || "").trim();
      if (text) return text;
      continue;
    }
    lastStatus = response.status;
    if (response.status === 401 || response.status === 403) break;
    if (response.status === 400 || response.status === 404 || response.status === 422) continue;
  }
  const err = new Error("groq");
  err.status = lastStatus;
  throw err;
}

export async function answerChat(apiKey, messages, snap) {
  const last = messages.at(-1)?.content || "";
  if (isGreeting(last) || !askedAboutMarket(last) || /rahmat|tashakkur/.test(last.toLowerCase())) {
    return localMarketReply(last, snap);
  }
  if (apiKey) {
    try {
      return await groqReply(apiKey, messages, snap);
    } catch {
      return localMarketReply(last, snap);
    }
  }
  return localMarketReply(last, snap);
}
