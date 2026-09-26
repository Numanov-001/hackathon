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
    title: "Pomidor: yozgi hosil 12 oy pastiga yaqin",
    summary: "Sentabr oylik o‘rtacha issiqxona qishidan past. Yanvar–mart odatda yuqori.",
    productId: "pomidor",
  },
  {
    id: "n2",
    time: "09:10",
    category: "Qurilish",
    title: "Metall truba: trend yuqori, mavsum yengil",
    summary: "24 oyda metall va kurs ko‘tarilgan. Bahor–yoz smetalari metrni qimmatlatadi.",
    productId: "metall-truba",
  },
  {
    id: "n3",
    time: "10:05",
    category: "Optom",
    title: "Un qopda barqaror, yog‘ importga sezgir",
    summary: "Tegirmon aylanmasi yuqori. Yog‘ ichki hosildan ko‘ra valyutaga bog‘liq.",
    productId: "un",
  },
  {
    id: "n4",
    time: "11:20",
    category: "Qurilish",
    title: "PE truba: suv tarmog‘i mart–iyunda",
    summary: "Viloyat loyihalari metr hisobida. PVC kanalizatsiya barqarorroq.",
    productId: "pe-truba",
  },
  {
    id: "n5",
    time: "12:15",
    category: "Mavsum",
    title: "Kartoshka va piyoz: kuzgi ombor",
    summary: "Yig‘imdan keyin arzon, bahorda ombor qimmat. Optom 10 kg dan.",
    productId: "kartoshka",
  },
  {
    id: "n6",
    time: "13:05",
    category: "Optom",
    title: "Guruch: Xorazm yig‘imi va import",
    summary: "Optom kilogramda. Un qoplaridan alohida kotirovka.",
    productId: "guruch",
  },
];
