import { CATEGORY_LABEL, yearlyVolume } from "./catalog";
import type { ChartPoint, Product } from "../types";

const MONTHS_UZ = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

export type MarketProfile = {
  hubs: string;
  season: string;
  drivers: string[];
  note: string;
};

export const MARKET_PROFILES: Record<string, MarketProfile> = {
  pomidor: {
    hubs: "Toshkent, Samarqand, Andijon issiqxonalari",
    season: "Iyul–sentabr dala; dekabr–mart issiqxona",
    drivers: ["Issiqxona energiya", "Yozgi hosil", "Viloyatdan yetkazish"],
    note: "Qishki o‘rtacha yozgidan ancha yuqori. Kg so‘rashadi, qop emas.",
  },
  kartoshka: {
    hubs: "Samarqand, Buxoro, Toshkent omborlari",
    season: "Sentabr–noyabr yig‘im; qish–bahor ombor",
    drivers: ["Kuzgi yig‘im", "Ombor zaxirasi", "Optom 10 kg dan"],
    note: "Yig‘imdan keyin arzon, bahorda ombor qimmatroq. Hajm sabzavot ichida yuqori.",
  },
  piyoz: {
    hubs: "Andijon, Namangan, Qashqadaryo",
    season: "Avgust–oktabr yig‘im",
    drivers: ["Kuzgi zaxira", "Eksport talabi", "Ombor namligi"],
    note: "Yig‘im oyida past, kech bahorda qimmatlashadi.",
  },
  bodring: {
    hubs: "Toshkent viloyati, Farg‘ona issiqxonalari",
    season: "Iyun–avgust dala; qish issiqxona",
    drivers: ["Issiqxona", "Yozgi hosil", "Tez buzilish"],
    note: "Saqlanmaydi — kunlik taklif narxni tez siljitadi.",
  },
  "pe-truba": {
    hubs: "Toshkent, Samarqand qurilish bozorlari",
    season: "Mart–iyun suv tarmog‘i mavsumi",
    drivers: ["Viloyat suv loyihalari", "Polimer narxi", "Optom metr"],
    note: "Hisob 1 metr. Qurilish ketganda talab ko‘tariladi.",
  },
  "metall-truba": {
    hubs: "Toshkent, Navoiy, Qashqadaryo",
    season: "Bahor–yoz qurilish; import metallga sezgir",
    drivers: ["Metall import", "Qurilish smetasi", "Valyuta"],
    note: "Sabzavotdan kam mavsumiy, lekin metall va kurs ta’sir qiladi.",
  },
  "pvc-truba": {
    hubs: "Toshkent, Farg‘ona",
    season: "Kanalizatsiya obyektlari bahor–kuz",
    drivers: ["PVC xomashyo", "Uy-joy qurilishi", "Optom metr"],
    note: "PE dan barqarorroq. Hisob metrda.",
  },
  un: {
    hubs: "Toshkent, Jizzax, Qashqadaryo tegirmonlari",
    season: "Bug‘doy yig‘imidan keyin qop arzonroq",
    drivers: ["Mahalliy bug‘doy", "Import un", "Ombor aylanmasi"],
    note: "Do‘konda qop so‘rashadi. Kg kotirovkasi alohida emas.",
  },
  yog: {
    hubs: "Toshkent optom, import omborlari",
    season: "Import partiyasiga bog‘liq, yengil mavsum",
    drivers: ["Import", "Valyuta", "Ombor zaxirasi"],
    note: "Ichki hosildan ko‘ra tashqi narx va kurs muhim.",
  },
  guruch: {
    hubs: "Xorazm, Qoraqalpog‘iston, Toshkent optom",
    season: "Kuzgi yig‘im; qish ombor",
    drivers: ["Mahalliy yig‘im", "Import guruch", "Qop/kg farqi"],
    note: "Optom kilogramda. Un qoplaridan alohida kotirovka.",
  },
};

function live(points: ChartPoint[]) {
  return points.filter((point) => point.price > 0);
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdev(values: number[]) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function monthLabel(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return `${MONTHS_UZ[date.getMonth()]} ${date.getFullYear()}`;
}

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Number((((part - whole) / whole) * 100).toFixed(1));
}

export function analyzeProduct(product: Product, products: Product[]) {
  const series = live(product.chartData);
  const year = series.slice(-12);
  const prevYear = series.slice(-24, -12);
  const prices = year.map((point) => point.price);
  const last = prices.at(-1) ?? product.price;
  const prevMonth = prices.at(-2) ?? last;
  const yearAgo = series.at(-13)?.price ?? last;
  const high = prices.length ? Math.max(...prices) : last;
  const low = prices.length ? Math.min(...prices) : last;
  const yearAvg = Math.round(mean(prices) || last);
  const prevAvg = Math.round(mean(prevYear.map((point) => point.price)) || yearAvg);
  const span = Math.max(high - low, 1);
  const position = Math.round(((last - low) / span) * 100);
  const cheap = year.reduce((best, point) => (point.price < best.price ? point : best), year[0] ?? { date: "", price: last, volume: 0 });
  const dear = year.reduce((best, point) => (point.price > best.price ? point : best), year[0] ?? { date: "", price: last, volume: 0 });
  const peers = products.filter((item) => item.category === product.category);
  const peerAvg = Math.round(mean(peers.map((item) => item.price)) || last);
  const rankExpensive = [...peers].sort((a, b) => b.price - a.price).findIndex((item) => item.id === product.id) + 1;
  const kgPeers = products.filter((item) => item.unit === "kg");
  const basket = Math.round(mean(kgPeers.map((item) => item.price)));
  const vsAvg = pct(last, yearAvg);
  const stance =
    position >= 75 ? "12 oylik yuqoriga yaqin" : position <= 25 ? "12 oylik pastga yaqin" : "12 oylik o‘rtada";

  return {
    last,
    prevMonth,
    yearAgo,
    mom: pct(last, prevMonth),
    yoy: pct(last, yearAgo),
    yoyAvg: pct(yearAvg, prevAvg),
    yearAvg,
    high,
    low,
    position,
    volPct: Number(((stdev(prices) / (mean(prices) || 1)) * 100).toFixed(1)),
    volume: yearlyVolume(product),
    cheapLabel: cheap.date ? monthLabel(cheap.date) : "—",
    cheapPrice: cheap.price,
    dearLabel: dear.date ? monthLabel(dear.date) : "—",
    dearPrice: dear.price,
    peerAvg,
    vsPeer: pct(last, peerAvg),
    peerRank: rankExpensive,
    peerCount: peers.length,
    categoryLabel: CATEGORY_LABEL[product.category],
    vsBasket: product.unit === "kg" && basket ? pct(last, basket) : null,
    vsAvg,
    stance,
    profile: MARKET_PROFILES[product.id],
  };
}

export type PriceBand = "arzon" | "odatdagi" | "qimmat";

export function priceBand(position: number): PriceBand {
  if (position <= 33) return "arzon";
  if (position >= 67) return "qimmat";
  return "odatdagi";
}

const BAND_TITLE: Record<PriceBand, string> = {
  arzon: "Hozir arzonroq",
  odatdagi: "Hozir odatdagidek",
  qimmat: "Hozir qimmatroq",
};

const BAND_HINT: Record<PriceBand, string> = {
  arzon: "Shu yilning past narxiga yaqin. Olish uchun qulay vaqt.",
  odatdagi: "Na judayam arzon, na judayam qimmat.",
  qimmat: "Shu yilning yuqori narxiga yaqin. Kutish mumkin.",
};

export function plainRead(stats: ReturnType<typeof analyzeProduct>) {
  const band = priceBand(stats.position);
  return {
    band,
    title: BAND_TITLE[band],
    hint: BAND_HINT[band],
  };
}
