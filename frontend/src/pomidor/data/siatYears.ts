import { PRICES_2025 } from "./siat2025";
import { SIAT_ROWS } from "./siatOfficial";

export const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

export const PRICES_2024: Record<string, number[]> = {
  pomidor: [30246.9, 29458.2, 29467.5, 29926.3, 21383.6, 11280.2, 5678.1, 5525.4, 7560.5, 10645.6, 19056.3, 22557.0],
  bodring: [30999.1, 29931.8, 28611.4, 20722.5, 9631.6, 5863.5, 4643.7, 5707.2, 7853.3, 9471.9, 15761.9, 23333.3],
  kartoshka: [4539.8, 4515.3, 4533.3, 4629.9, 5067.3, 5008.9, 4653.2, 4887.6, 5389.1, 5468.9, 5927.5, 6429.6],
  piyoz: [3196.4, 3203.6, 3114.2, 3029.4, 2633.3, 2157.9, 2132.9, 2383.2, 2581.3, 2653.2, 2946.5, 3165.0],
  sabzi: [3240.7, 3099.5, 3137.4, 3123.1, 3216.8, 3253.3, 3198.1, 3562.0, 4041.2, 4110.5, 3957.8, 3806.9],
  qalampir: [31186.2, 38028.1, 46960.6, 48995.0, 27457.7, 14050.3, 8375.6, 7108.6, 7259.7, 9468.4, 17628.2, 28387.9],
  karam: [3269.3, 3028.2, 3060.9, 3209.5, 2782.7, 2197.5, 2278.6, 2528.9, 2635.4, 2750.6, 2951.2, 3130.3],
  olma: [15782.1, 16189.3, 16289.8, 16697.0, 17324.1, 17133.6, 15224.0, 14016.7, 13267.4, 12685.3, 13099.2, 13668.0],
  uzum: [37405.2, 38947.4, 40833.0, 42305.0, 43914.8, 31688.9, 16651.2, 14803.0, 13962.1, 14046.3, 17094.6, 22202.4],
  tarvuz: [8783.1, 12434.4, 14130.2, 53091.7, 12634.5, 4866.6, 1919.2, 1279.3, 1733.3, 2270.0, 2775.4, 3214.2],
};

/** 2026 SIAT 1329 through August; later months are 0 until published. */
export const PRICES_2026: Record<string, number[]> = {
  pomidor: [26148.4, 31406.7, 34804.2, 29966.5, 18693.3, 9957.7, 7836.3, SIAT_ROWS.pomidor[11], 0, 0, 0, 0],
  bodring: [39345.3, 32928.1, 27395.1, 15236.9, 9149.4, 7210.0, 7041.9, SIAT_ROWS.bodring[11], 0, 0, 0, 0],
  kartoshka: [6283.0, 6676.5, 7229.7, 7482.5, 7530.3, 6443.0, 5215.6, SIAT_ROWS.kartoshka[11], 0, 0, 0, 0],
  piyoz: [3061.6, 2973.7, 2862.8, 2754.9, 2618.3, 2720.7, 2860.9, SIAT_ROWS.piyoz[11], 0, 0, 0, 0],
  sabzi: [4100.1, 4221.3, 4220.1, 4318.0, 4424.6, 4685.1, 5281.1, SIAT_ROWS.sabzi[11], 0, 0, 0, 0],
  qalampir: [33694.7, 35922.4, 40164.5, 40358.3, 26574.1, 15140.2, 10471.6, SIAT_ROWS.qalampir[11], 0, 0, 0, 0],
  karam: [5666.3, 5671.7, 5535.6, 5251.0, 4293.5, 3808.2, 4111.0, SIAT_ROWS.karam[11], 0, 0, 0, 0],
  olma: [17346.3, 18014.2, 18818.4, 20039.4, 20691.9, 19953.4, 17047.7, SIAT_ROWS.olma[11], 0, 0, 0, 0],
  uzum: [26582.3, 28373.8, 29805.1, 29720.1, 35402.0, 26578.1, 17596.6, SIAT_ROWS.uzum[11], 0, 0, 0, 0],
  tarvuz: [6238.6, 0, 0, 0, 5457.8, 3779.0, 2459.1, SIAT_ROWS.tarvuz[11], 0, 0, 0, 0],
};

export const YEAR_SERIES = {
  2024: PRICES_2024,
  2025: PRICES_2025,
  2026: PRICES_2026,
} as const;

export type YearKey = keyof typeof YEAR_SERIES;

function live(values: number[]) {
  return values.filter((value) => value > 0);
}

export function yearAvg(values: number[]) {
  const rows = live(values);
  return rows.length ? Math.round(rows.reduce((sum, value) => sum + value, 0) / rows.length) : 0;
}

export function yearLast(values: number[]) {
  return Math.round(live(values).at(-1) ?? 0);
}

export function compareMonths(id: string) {
  return MONTHS.map((label, index) => ({
    label,
    y2024: PRICES_2024[id]?.[index] || null,
    y2025: PRICES_2025[id]?.[index] || null,
    y2026: PRICES_2026[id]?.[index] || null,
  }));
}
