export function money(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function volume(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function timeAgo(iso) {
  if (!iso) return "—";
  const then = new Date(iso);
  const delta = Math.max(0, Date.now() - then.getTime());
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function exactTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", { hour12: false });
}

export function lastLiveMedian(history, regionName = null) {
  if (!history?.regions?.length) return null;
  const regions = regionName
    ? history.regions.filter((item) => item.region === regionName)
    : history.regions;
  const lives = regions.flatMap((item) =>
    item.data.filter((point) => point.source === "user_ask_median"),
  );
  if (!lives.length) return null;
  lives.sort((a, b) => a.date.localeCompare(b.date));
  return Number(lives[lives.length - 1].median_price);
}

export function sparklinePoints(history, regionName = null) {
  if (!history?.regions?.length) return [];
  const series = (regionName
    ? history.regions.find((item) => item.region === regionName)
    : history.regions[0]
  )?.data || [];
  return series.slice(-16).map((point) => Number(point.median_price)).filter((n) => !Number.isNaN(n));
}

export function filterHistory(history, timeframe, enabledRegions) {
  if (!history) return null;
  const days = { "1D": 1, "1W": 7, "1M": 30, "3M": 90, "1Y": 365 }[timeframe] ?? 365;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return {
    ...history,
    regions: history.regions
      .filter((item) => enabledRegions.includes(item.region))
      .map((item) => ({
        ...item,
        data: item.data.filter((point) => new Date(point.date) >= cutoff),
      })),
  };
}
