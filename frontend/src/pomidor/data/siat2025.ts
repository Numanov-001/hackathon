import { SIAT_SOURCE } from "./siatOfficial";

export const MONTHS_2025 = [
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
];

/** Official SIAT 1329 monthly store averages for calendar year 2025, UZS/kg. */
export const PRICES_2025: Record<string, number[]> = {
  pomidor: [24410.5, 27533.1, 37366.2, 34739.9, 21816.9, 13717.5, 7880.2, 6231.3, 8247.5, 13486.8, 20438.8, 26588.4],
  bodring: [24616.9, 25978.6, 28224.0, 16061.5, 5666.2, 4111.0, 9422.3, 10474.7, 7664.6, 11925.6, 21711.3, 33053.2],
  kartoshka: [7446.5, 7755.6, 6809.2, 7105.3, 6958.2, 6639.9, 6517.9, 6812.2, 6606.3, 6142.7, 5985.6, 6040.0],
  piyoz: [3226.2, 3227.2, 3341.8, 4258.0, 4799.4, 4573.0, 4554.0, 4335.8, 3879.1, 3484.0, 3246.0, 3161.4],
  sabzi: [3843.4, 3919.2, 5619.1, 6367.0, 6510.0, 7592.6, 7285.9, 7157.6, 7500.3, 6461.9, 4739.2, 4005.9],
  qalampir: [38100.7, 40177.6, 40492.7, 43920.4, 27122.9, 15762.4, 10146.7, 8941.1, 10474.5, 12928.8, 17683.6, 26170.2],
  karam: [3547.6, 4535.6, 5139.0, 6139.2, 5560.0, 4372.0, 5045.8, 6719.7, 5987.7, 5522.7, 5135.2, 5395.5],
  olma: [14254.5, 14253.1, 14281.1, 14857.5, 15804.9, 15756.7, 14218.5, 13767.5, 14152.4, 14442.0, 15365.7, 16439.3],
  uzum: [26229.6, 27778.4, 33432.7, 38248.9, 41903.2, 26508.2, 16224.1, 16077.8, 15504.3, 17099.5, 19371.1, 22902.6],
  tarvuz: [3901.9, 5410.6, 0, 0, 10968.5, 2918.0, 2121.1, 3048.7, 3222.5, 3710.7, 4488.9, 5691.1],
};

const NAMES: Record<string, string> = {
  pomidor: "Pomidor",
  bodring: "Bodring",
  kartoshka: "Kartoshka",
  piyoz: "Piyoz",
  sabzi: "Sabzi",
  qalampir: "Qalampir",
  karam: "Karam",
  olma: "Olma",
  uzum: "Uzum",
  tarvuz: "Tarvuz",
};

function usable(values: number[]) {
  return values.filter((value) => value > 0);
}

function volumeFromPrices(values: number[]) {
  const live = usable(values);
  const median = live.slice().sort((a, b) => a - b)[Math.floor(live.length / 2)] || 1;
  return values.map((price) => (price > 0 ? Math.round((180_000 * median) / price) : 0));
}

export type ProductYearStat = {
  id: string;
  name: string;
  avg: number;
  yoy: number;
  volume: number;
  jan: number;
  dec: number;
  line: Array<{ month: string; price: number }>;
};

export function yearStats2025(): ProductYearStat[] {
  return Object.entries(PRICES_2025).map(([id, values]) => {
    const live = usable(values);
    const jan = live[0];
    const dec = live.at(-1) ?? jan;
    const avg = live.reduce((sum, value) => sum + value, 0) / live.length;
    const volumes = volumeFromPrices(values);
    return {
      id,
      name: NAMES[id],
      avg: Math.round(avg),
      yoy: Number((((dec - jan) / jan) * 100).toFixed(1)),
      volume: volumes.reduce((sum, value) => sum + value, 0),
      jan: Math.round(jan),
      dec: Math.round(dec),
      line: MONTHS_2025.map((month, index) => ({ month, price: values[index] })),
    };
  });
}

export function market2025() {
  const rows = yearStats2025();
  const topVolume = [...rows].sort((a, b) => b.volume - a.volume)[0];
  const topUp = [...rows].sort((a, b) => b.yoy - a.yoy)[0];
  const topDown = [...rows].sort((a, b) => a.yoy - b.yoy)[0];
  const avg = Math.round(rows.reduce((sum, row) => sum + row.avg, 0) / rows.length);
  const growth = Number((rows.reduce((sum, row) => sum + row.yoy, 0) / rows.length).toFixed(1));
  return { rows, topVolume, topUp, topDown, avg, growth, source: SIAT_SOURCE };
}
