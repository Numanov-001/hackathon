export type NewsCategory = "Narx" | "Mavsum" | "Qurilish" | "Optom";

export type NewsItem = {
  id: string;
  time: string;
  category: NewsCategory;
  title: string;
  summary: string;
  productId?: string;
};

export const MARKET_NEWS: NewsItem[] = [
  {
    id: "n1",
    time: "08:40",
    category: "Narx",
    title: "Pomidor yozgi hosildan keyin arzon",
    summary: "Sentabr oylik o‘rtacha pastroq. Issiqxona mavsumi qishda narxni ko‘taradi.",
    productId: "pomidor",
  },
  {
    id: "n2",
    time: "09:10",
    category: "Qurilish",
    title: "Metall truba 24 oyda qimmatlashdi",
    summary: "Qurilish mavsumi va metall narxi. Optom yetkazish Toshkent–Samarqand.",
    productId: "metall-truba",
  },
  {
    id: "n3",
    time: "10:05",
    category: "Optom",
    title: "Bug‘doy uni barqaror, yog‘ tebranadi",
    summary: "Un qoplari ombor aylanmasi yuqori. Yog‘ importga sezgir.",
    productId: "un",
  },
  {
    id: "n4",
    time: "11:20",
    category: "Qurilish",
    title: "PE truba suv tarmog‘iga talab",
    summary: "Viloyat loyihalari metr hisobida. PVC kanalizatsiya barqarorroq.",
    productId: "pe-truba",
  },
  {
    id: "n5",
    time: "12:15",
    category: "Mavsum",
    title: "Kartoshka va piyoz ombor zaxirasi",
    summary: "Kuzgi yig‘im. Optom yetkazish 10 kg dan.",
    productId: "kartoshka",
  },
  {
    id: "n6",
    time: "13:05",
    category: "Optom",
    title: "Guruch ombor aylanmasi barqaror",
    summary: "Optom yetkazish kilogramda. Un qoplari alohida kotirovka.",
    productId: "guruch",
  },
];
