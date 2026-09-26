/** Last successful parse of SIAT dataset 1329 (store average UZS/kg). */
export const SIAT_SOURCE = {
  title: "Do‘konlardagi ayrim tovarlarning o‘rtacha narxlari dinamikasi",
  dataset: "1329",
  url: "https://siat.stat.uz/data/1329/",
  page: "https://stat.uz/uz/rasmiy-statistika/prices-and-indexes-2",
  label: "Manba: O‘zbekiston Respublikasi Milliy statistika qo‘mitasi (stat.uz)",
};

export const SIAT_MONTHS = [
  "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02", "2026-03", "2026-04",
  "2026-05", "2026-06", "2026-07", "2026-08",
] as const;

export const SIAT_ROWS: Record<string, number[]> = {
  pomidor: [8247.5, 13486.8, 20438.8, 26588.4, 26148.4, 31406.7, 34804.2, 29966.5, 18693.3, 9957.7, 7836.3, 9330.1],
  bodring: [7664.6, 11925.6, 21711.3, 33053.2, 39345.3, 32928.1, 27395.1, 15236.9, 9149.4, 7210.0, 7041.9, 7318.1],
  kartoshka: [6606.3, 6142.7, 5985.6, 6040.0, 6283.0, 6676.5, 7229.7, 7482.5, 7530.3, 6443.0, 5215.6, 5147.6],
  piyoz: [3879.1, 3484.0, 3246.0, 3161.4, 3061.6, 2973.7, 2862.8, 2754.9, 2618.3, 2720.7, 2860.9, 3129.2],
  sabzi: [7500.3, 6461.9, 4739.2, 4005.9, 4100.1, 4221.3, 4220.1, 4318.0, 4424.6, 4685.1, 5281.1, 5796.2],
  qalampir: [10474.5, 12928.8, 17683.6, 26170.2, 33694.7, 35922.4, 40164.5, 40358.3, 26574.1, 15140.2, 10471.6, 9819.3],
  karam: [5987.7, 5522.7, 5135.2, 5395.5, 5666.3, 5671.7, 5535.6, 5251.0, 4293.5, 3808.2, 4111.0, 4146.2],
  olma: [14152.4, 14442.0, 15365.7, 16439.3, 17346.3, 18014.2, 18818.4, 20039.4, 20691.9, 19953.4, 17047.7, 16115.6],
  uzum: [15504.3, 17099.5, 19371.1, 22902.6, 26582.3, 28373.8, 29805.1, 29720.1, 35402.0, 26578.1, 17596.6, 16563.9],
  tarvuz: [3222.5, 3710.7, 4488.9, 5691.1, 6238.6, 0, 0, 0, 5457.8, 3779.0, 2459.1, 2856.7],
};

export const SIAT_ALIASES: Record<string, string[]> = {
  pomidor: ["Pomidor"],
  bodring: ["Bodring"],
  kartoshka: ["Kartoshka"],
  piyoz: ["Piyoz"],
  sabzi: ["Sabzi"],
  qalampir: ["Bulg'or qalampiri", "Bulg‘or qalampiri", "Qalampir"],
  karam: ["Karam"],
  olma: ["Olma"],
  uzum: ["Uzum"],
  tarvuz: ["Tarvuz"],
};
