export function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(value);
}

export function digitsOnly(raw: string) {
  return raw.replace(/\D/g, "");
}

export function formatSomInput(raw: string) {
  const digits = digitsOnly(raw);
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function signedPct(value: number) {
  const abs = Math.abs(value).toFixed(1);
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${abs}%`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
