const TICKERS: Record<string, string> = {
  pomidor: "POMIDOR",
  kartoshka: "KARTOSHKA",
  piyoz: "PIYOZ",
  bodring: "BODRING",
  "pe-truba": "PE-T",
  "metall-truba": "METAL-T",
  "pvc-truba": "PVC-T",
  un: "UN",
  yog: "YOG",
  guruch: "GURUCH",
};

export function tickerOf(id: string) {
  return TICKERS[id] ?? id.toUpperCase();
}
