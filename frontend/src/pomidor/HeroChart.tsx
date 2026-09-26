import { useId, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Clock,
  Eye,
  Info,
  Lightbulb,
  Lock,
  Sparkles,
  SunMedium,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartBlurb } from "./data/briefs";
import ProductMark from "./ProductMark";
import { formatPrice, signedPct } from "./lib/format";
import { tickerOf } from "./lib/ticker";
import { priceUnit } from "./lib/unit";
import { cn } from "./lib/cn";
import { postJson } from "../api/client";
import type { ForecastHorizon, PlanId, PredictionData, Product } from "./types";

const MONTHS_UZ = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const RANGES = [
  { id: "3M", months: 3 },
  { id: "6M", months: 6 },
  { id: "1Y", months: 12 },
  { id: "2Y", months: 24 },
] as const;

const HORIZONS: { id: ForecastHorizon; label: string }[] = [
  { id: 3, label: "3 oy" },
  { id: 6, label: "6 oy" },
  { id: 12, label: "1 yil" },
];

const CONFIDENCE_LABEL: Record<string, { text: string; dotColor: string }> = {
  yuqori: {
    text: "Yuqori ishonch",
    dotColor: "bg-emerald-500",
  },
  "o'rta": {
    text: "O'rta ishonch",
    dotColor: "bg-amber-500",
  },
  past: {
    text: "Past ishonch",
    dotColor: "bg-slate-400",
  },
};

const ACTION_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
  "Hozir olish": {
    label: "Hozir olish",
    icon: CheckCircle2,
    className: "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20",
  },
  "Kutish": {
    label: "Kutish",
    icon: Clock,
    className: "bg-amber-600 text-white shadow-xs shadow-amber-600/20",
  },
  "Kuzatib turish": {
    label: "Kuzatib turish",
    icon: Eye,
    className: "bg-slate-700 text-white shadow-xs",
  },
};

function monthTick(value: string) {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return `${MONTHS_UZ[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

function monthLabel(value: string) {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`);
  return date.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" });
}

// Custom rendered dot for visible prediction points
function ForecastDot(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload || payload.price != null) {
    return <circle cx={0} cy={0} r={0} fill="none" opacity={0} />;
  }
  return (
    <g key={`forecast-dot-${payload.date}`}>
      <circle cx={cx} cy={cy} r={7} fill="#4F46E5" fillOpacity={0.25} />
      <circle cx={cx} cy={cy} r={4.5} fill="#4F46E5" stroke="#FFFFFF" strokeWidth={2} />
    </g>
  );
}

type HeroChartProps = {
  product: Product;
  plan: PlanId;
  getToken?: () => Promise<string | null>;
  isSignedIn: boolean;
  onNeedAuth: () => void;
  onNeedPlan: () => void;
};

type MergedPoint = {
  date: string;
  price?: number;
  forecast?: number;
  forecastLow?: number;
  forecastHigh?: number;
};

export default function HeroChart({ product, plan, getToken, isSignedIn, onNeedAuth, onNeedPlan }: HeroChartProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("1Y");
  const [helpOpen, setHelpOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [horizon, setHorizon] = useState<ForecastHorizon>(6);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [horizonMenuOpen, setHorizonMenuOpen] = useState(false);

  const helpId = useId();
  const fillId = useId().replace(/:/g, "");
  const forecastFillId = useId().replace(/:/g, "");
  const bandFillId = useId().replace(/:/g, "");
  const up = product.change >= 0;
  const color = up ? "#0E6B3C" : "#9B1C1C";
  const forecastColor = "#4F46E5";
  const paid = plan === "starter" || plan === "business";

  const horizonRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => {
    const live = product.chartData.filter((point) => point.price > 0);
    const months = RANGES.find((item) => item.id === range)?.months ?? 12;
    return live.slice(-months);
  }, [product.chartData, range]);

  // Merge historical + prediction data for chart
  const mergedData = useMemo((): MergedPoint[] => {
    if (!forecastOpen || !prediction?.predicted_points.length) {
      return data.map((p) => ({ date: p.date, price: p.price }));
    }

    const historical: MergedPoint[] = data.map((p) => ({ date: p.date, price: p.price }));

    // Bridge point: last historical point also starts forecast
    const lastHistorical = data[data.length - 1];
    if (lastHistorical) {
      historical[historical.length - 1] = {
        ...historical[historical.length - 1],
        forecast: lastHistorical.price,
        forecastLow: lastHistorical.price,
        forecastHigh: lastHistorical.price,
      };
    }

    const forecastPoints: MergedPoint[] = prediction.predicted_points.map((p) => ({
      date: `${p.date}-01`,
      forecast: p.price,
      forecastLow: p.low,
      forecastHigh: p.high,
    }));

    return [...historical, ...forecastPoints];
  }, [data, forecastOpen, prediction]);

  async function fetchPrediction(h: ForecastHorizon) {
    if (!isSignedIn) {
      onNeedAuth();
      return;
    }
    if (!paid) {
      onNeedPlan();
      return;
    }

    setHorizon(h);
    setForecastOpen(true);
    setHorizonMenuOpen(false);
    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const token = getToken ? await getToken() : null;
      const result = (await postJson(
        `/api/forecast/${encodeURIComponent(product.id)}/predict`,
        { horizon: h },
        token,
      )) as PredictionData;
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prognoz yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  }

  function closeForecast() {
    setForecastOpen(false);
    setPrediction(null);
    setError("");
    setHorizonMenuOpen(false);
  }

  return (
    <section className="flex h-full min-h-0 flex-col rounded-[10px] border border-line bg-surface p-4 sm:min-h-[420px] sm:p-5">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:flex-wrap">
        <div className="flex items-center gap-3">
          <ProductMark name={product.name} image={product.image} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-ink">{product.name}</h2>
              <button
                type="button"
                aria-expanded={helpOpen}
                aria-controls={helpId}
                aria-label="Grafik nima ko'rsatadi"
                onClick={() => setHelpOpen((current) => !current)}
                className={cn(
                  "cursor-pointer grid h-8 w-8 place-items-center rounded-[6px] text-muted outline-none hover:bg-subtle hover:text-ink focus-visible:ring-2 focus-visible:ring-focus transition-colors",
                  helpOpen && "bg-soft text-accent",
                )}
              >
                <CircleHelp size={16} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
            <p className="text-[13px] text-muted">{tickerOf(product.id)} · {priceUnit(product.unit)}</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex w-full rounded-[6px] bg-subtle p-1 sm:w-auto" role="group" aria-label="Vaqt oralig'i">
            {RANGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setRange(item.id); if (forecastOpen) closeForecast(); }}
                aria-pressed={range === item.id}
                className={cn(
                  "min-h-10 flex-1 cursor-pointer rounded-[6px] px-3 text-[13px] font-semibold transition-colors sm:flex-none",
                  range === item.id ? "bg-surface text-ink ring-1 ring-line shadow-xs" : "text-muted hover:text-ink",
                )}
              >
                {item.id}
              </button>
            ))}
          </div>

          <div className="relative" ref={horizonRef}>
            <button
              type="button"
              onClick={() => {
                if (forecastOpen) {
                  closeForecast();
                } else {
                  setHorizonMenuOpen((v) => !v);
                }
              }}
              disabled={loading}
              className={cn(
                "flex min-h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[6px] px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 sm:w-auto",
                forecastOpen
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800"
                  : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xs hover:shadow-md hover:brightness-105 active:scale-95",
                loading && "animate-pulse cursor-wait opacity-70",
                !paid && isSignedIn && "opacity-60",
              )}
            >
              {!paid && isSignedIn ? (
                <Lock size={14} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
              )}
              <span>{forecastOpen ? `Prognoz (${horizon} oy)` : "Prognoz"}</span>
              {!forecastOpen && (
                <svg width="10" height="6" viewBox="0 0 10 6" className="ml-0.5" aria-hidden="true">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Horizon dropdown */}
            {horizonMenuOpen && !forecastOpen && (
              <div className="absolute right-0 top-full z-30 mt-1.5 min-w-[120px] flex flex-col rounded-[8px] border border-line bg-surface p-1 shadow-overlay">
                {HORIZONS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => fetchPrediction(h.id)}
                    className="cursor-pointer rounded-[6px] px-4 py-2 text-left text-[13px] font-medium text-ink hover:bg-subtle transition-colors"
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {helpOpen && (
        <p id={helpId} className="mb-4 rounded-[10px] bg-subtle px-3 py-2 text-sm text-muted">
          {chartBlurb(product)}
        </p>
      )}

      <div className="mb-3">
        <p className="tabular text-[28px] font-semibold leading-none tracking-tight text-ink sm:text-[32px]">
          {formatPrice(product.price)}
          <span className="ml-2 text-base font-medium text-muted">{priceUnit(product.unit)}</span>
        </p>
        <p className={cn("mt-2 inline-flex items-center gap-1 text-sm font-semibold", up ? "text-ask" : "text-bid")}>
          {up ? <TrendingUp size={16} strokeWidth={1.8} aria-hidden="true" /> : <TrendingDown size={16} strokeWidth={1.8} aria-hidden="true" />}
          <span>{signedPct(product.change)}</span>
          <span className="font-medium text-muted">oxirgi oyga nisbatan</span>
        </p>
      </div>

      {forecastOpen && (
        <div className="mb-2.5 flex flex-wrap items-center gap-4 text-[12px] text-muted">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-medium text-ink">Tarixiy narx</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-3 border-b-2 border-dashed border-[#4F46E5]" />
              <span className="inline-block h-2 w-2 rounded-full border border-white bg-[#4F46E5]" />
            </span>
            <span className="font-semibold text-ink">AI Bashorat nuqtalari</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3.5 rounded border border-line bg-subtle" />
            <span>Kutilayotgan oraliq (Min–Maks)</span>
          </div>
        </div>
      )}

      <div className="h-[220px] w-full sm:h-[280px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mergedData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.16} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={forecastFillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={forecastColor} stopOpacity={0.16} />
                <stop offset="100%" stopColor={forecastColor} stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id={bandFillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E0E3EB" vertical={false} />
            <XAxis dataKey="date" tickFormatter={monthTick} tick={{ fill: "#4E5A54", fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={28} />
            <YAxis
              tickFormatter={(value) => formatPrice(Number(value))}
              tick={{ fill: "#4E5A54", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
              domain={[(min: number) => Math.floor(min * 0.94), (max: number) => Math.ceil(max * 1.04)]}
            />
            <Tooltip
              cursor={{ stroke: forecastOpen ? forecastColor : color, strokeWidth: 1.5, strokeDasharray: "3 4" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0]?.payload as MergedPoint | undefined;
                if (!point) return null;
                const isForecast = point.forecast != null && point.price == null;
                const displayPrice = isForecast ? point.forecast! : point.price!;
                return (
                  <div className={cn("rounded-[8px] border px-3 py-2 shadow-overlay", isForecast ? "border-indigo-200 bg-white/95 dark:border-indigo-800 dark:bg-slate-900" : "border-line bg-surface")}>
                    {isForecast ? (
                      <div className="mb-1 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-indigo-600" />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">AI Prognozi</p>
                      </div>
                    ) : null}
                    <p className="tabular text-[14px] font-bold text-ink">{formatPrice(displayPrice)} {priceUnit(product.unit)}</p>
                    {isForecast && point.forecastLow != null && point.forecastHigh != null && (
                      <p className="tabular text-[11px] font-medium text-muted">
                        Oraliq: <span className="text-indigo-700 dark:text-indigo-300">{formatPrice(point.forecastLow)} – {formatPrice(point.forecastHigh)}</span>
                      </p>
                    )}
                    <p className="text-[12px] capitalize text-muted mt-0.5">{monthLabel(point.date)}</p>
                  </div>
                );
              }}
            />
            {/* Historical area */}
            <Area
              type="linear"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4.5, fill: color, stroke: "#fff", strokeWidth: 2 }}
              connectNulls={false}
            />
            {/* Forecast confidence band */}
            {forecastOpen && prediction && (
              <>
                <Area
                  type="monotone"
                  dataKey="forecastHigh"
                  stroke="#818CF8"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  strokeOpacity={0.7}
                  fill={`url(#${bandFillId})`}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="forecastLow"
                  stroke="#818CF8"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  strokeOpacity={0.7}
                  fill="#fff"
                  fillOpacity={0.88}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                />
              </>
            )}
            {/* Forecast line with crisp visible dots */}
            {forecastOpen && (
              <Area
                type="monotone"
                dataKey="forecast"
                stroke={forecastColor}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                fill={`url(#${forecastFillId})`}
                isAnimationActive={false}
                dot={ForecastDot}
                activeDot={{ r: 6.5, fill: forecastColor, stroke: "#fff", strokeWidth: 2.5 }}
                connectNulls={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction explanation panel */}
      {forecastOpen && (loading || error || prediction) && (
        <section className="mt-5 rounded-[10px] border border-line bg-surface overflow-hidden shadow-xs">
          {/* Panel Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 bg-surface">
            <div className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 place-items-center rounded-[6px] bg-subtle text-ink">
                <Sparkles size={15} strokeWidth={2} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">
                  AI Bozor Prognozi — {product.name}
                </h3>
                <span className="rounded-[4px] bg-subtle px-2 py-0.5 text-[11px] font-semibold text-muted">
                  {horizon} oylik
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {prediction && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[12px] font-medium text-ink shadow-xs">
                  <span className={cn("h-2 w-2 rounded-full", CONFIDENCE_LABEL[prediction.confidence]?.dotColor || "bg-muted")} />
                  {CONFIDENCE_LABEL[prediction.confidence]?.text || prediction.confidence}
                </span>
              )}

              <button
                type="button"
                onClick={closeForecast}
                className="cursor-pointer grid h-7 w-7 place-items-center rounded-[6px] text-muted hover:bg-subtle hover:text-ink transition-colors"
                title="Prognozni yopish"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
                <p className="text-sm font-medium text-ink">Bozor tarixi va yangiliklari tahlil qilinmoqda...</p>
                <p className="text-xs text-muted">24 oylik narx trendi va mavsumiy sikllar hisoblanmoqda</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-[8px] border border-bid/20 bg-bid/5 p-3.5 text-sm text-bid">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {prediction && !loading && (
              <div className="space-y-4">
                {/* Action Recommendation Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-line bg-subtle p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Bozor harakati:</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1 text-xs font-bold",
                        ACTION_CONFIG[prediction.best_action]?.className || "bg-ink text-surface",
                      )}
                    >
                      {(() => {
                        const Icon = ACTION_CONFIG[prediction.best_action]?.icon || CheckCircle2;
                        return <Icon size={14} strokeWidth={2.4} />;
                      })()}
                      {prediction.best_action}
                    </span>
                  </div>

                  {prediction.predicted_points.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>Joriy narx: <strong className="text-ink">{formatPrice(product.price)}</strong></span>
                      <span>→</span>
                      <span>
                        Kutilayotgan yakuniy:{" "}
                        <strong className="text-ink">
                          {formatPrice(prediction.predicted_points[prediction.predicted_points.length - 1].price)} {priceUnit(product.unit)}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* 4 Professional Micro-Cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Trend Card */}
                  <div className="rounded-[8px] border border-line bg-surface p-3.5 transition-colors hover:border-line">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="grid h-6 w-6 place-items-center rounded-[6px] bg-subtle text-accent">
                        {prediction.trend === "up" ? (
                          <TrendingUp size={14} strokeWidth={2} />
                        ) : prediction.trend === "down" ? (
                          <TrendingDown size={14} strokeWidth={2} />
                        ) : (
                          <Activity size={14} strokeWidth={2} />
                        )}
                      </div>
                      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-muted">Kutilayotgan Trend</h4>
                    </div>
                    <p className="text-[13px] leading-relaxed text-ink">{prediction.explanation.direction}</p>
                  </div>

                  {/* Season Card */}
                  <div className="rounded-[8px] border border-line bg-surface p-3.5 transition-colors hover:border-line">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="grid h-6 w-6 place-items-center rounded-[6px] bg-subtle text-ink">
                        <SunMedium size={14} strokeWidth={2} />
                      </div>
                      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-muted">Mavsumiy Omil</h4>
                    </div>
                    <p className="text-[13px] leading-relaxed text-ink">{prediction.explanation.seasonal}</p>
                  </div>

                  {/* Driver Card */}
                  <div className="rounded-[8px] border border-line bg-surface p-3.5 transition-colors hover:border-line">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="grid h-6 w-6 place-items-center rounded-[6px] bg-subtle text-ink">
                        <Zap size={14} strokeWidth={2} />
                      </div>
                      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-muted">Asosiy Bozor Drayveri</h4>
                    </div>
                    <p className="text-[13px] leading-relaxed text-ink">{prediction.explanation.driver}</p>
                  </div>

                  {/* Recommendation Card */}
                  <div className="rounded-[8px] border border-line bg-surface p-3.5 transition-colors hover:border-line">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="grid h-6 w-6 place-items-center rounded-[6px] bg-subtle text-accent">
                        <Lightbulb size={14} strokeWidth={2} />
                      </div>
                      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-muted">Bozor Maslahati</h4>
                    </div>
                    <p className="text-[13px] font-medium leading-relaxed text-ink">{prediction.explanation.recommendation}</p>
                  </div>
                </div>

                {/* Clean Professional Disclaimer */}
                <div className="flex items-center gap-2 rounded-[6px] border border-line bg-subtle/50 px-3 py-2 text-[12px] text-muted">
                  <Info size={14} className="shrink-0 text-muted" />
                  <p className="leading-snug">{prediction.disclaimer}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </section>
  );
}
