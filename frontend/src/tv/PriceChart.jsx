import { useEffect, useRef } from "react";
import {
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LastPriceAnimationMode,
  LineSeries,
  LineStyle,
  createChart,
} from "lightweight-charts";
import { formatCompact, formatPrice, rangeStart } from "./mockData.js";

const BLUE = "#4aa3df";
const PURPLE = "#9b4dca";

export default function PriceChart({ bars, blue, purple, volume, range, symbol, tool, onLegend }) {
  const host = useRef(null);
  const api = useRef(null);
  const toolRef = useRef(tool);
  const symbolRef = useRef(symbol);
  toolRef.current = tool;
  symbolRef.current = symbol;

  useEffect(() => {
    const chart = createChart(host.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#787b86",
        fontSize: 11,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif',
      },
      localization: { locale: "en-US" },
      grid: {
        vertLines: { color: "#e6e9ef", style: LineStyle.SparseDotted },
        horzLines: { color: "#e6e9ef", style: LineStyle.SparseDotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#9598a1", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#131722" },
        horzLine: { color: "#9598a1", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#131722" },
      },
      rightPriceScale: {
        borderColor: "#e0e3eb",
        scaleMargins: { top: 0.06, bottom: 0.22 },
      },
      timeScale: {
        borderColor: "#e0e3eb",
        rightOffset: 8,
        fixLeftEdge: false,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const blueSeries = chart.addSeries(LineSeries, {
      color: BLUE,
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerRadius: 4,
      lastPriceAnimation: LastPriceAnimationMode.Disabled,
    });
    const purpleSeries = chart.addSeries(LineSeries, {
      color: PURPLE,
      lineWidth: 2,
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor: "rgba(155, 77, 202, 0.35)",
      priceLineStyle: LineStyle.SparseDotted,
      crosshairMarkerRadius: 4,
      lastPriceAnimation: LastPriceAnimationMode.Disabled,
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "",
      priceFormat: { type: "volume" },
      lastValueVisible: false,
      priceLineVisible: false,
    });
    const trendSeries = chart.addSeries(LineSeries, {
      color: "#131722",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    chart.priceScale("").applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } });

    const state = { chart, blueSeries, purpleSeries, volumeSeries, trendSeries, clicks: [], guides: [] };

    function barAt(time) {
      return state.bars?.find((bar) => bar.time === time) ?? null;
    }

    function publish(time) {
      const source = state.bars ?? [];
      const bar = time ? source.find((item) => item.time === time) : source.at(-1);
      if (!bar) return;
      const index = source.indexOf(bar);
      const prev = source[index - 1]?.close ?? bar.close;
      const change = bar.close - prev;
      onLegend({
        price: bar.close,
        change,
        pct: prev ? (change / prev) * 100 : 0,
        volume: bar.volume,
        blue: state.blueValue ?? null,
      });
    }

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        publish(null);
        return;
      }
      const purpleValue = param.seriesData.get(purpleSeries);
      const blueValue = param.seriesData.get(blueSeries);
      state.blueValue = blueValue?.value ?? null;
      publish(param.time);
      if (!purpleValue && blueValue) {
        const source = state.bars ?? [];
        const bar = source.find((item) => item.time === param.time);
        if (!bar) return;
        const index = source.indexOf(bar);
        const prev = source[index - 1]?.close ?? bar.close;
        const change = blueValue.value - prev;
        onLegend({
          price: blueValue.value,
          change,
          pct: prev ? (change / prev) * 100 : 0,
          volume: bar.volume,
          blue: blueValue.value,
        });
      }
    });

    chart.subscribeClick((param) => {
      if (!param.point || !param.time) return;
      const active = toolRef.current;
      const price = purpleSeries.coordinateToPrice(param.point.y);
      if (price == null) return;
      if (active === "trend" || active === "measure") {
        state.clicks.push({ time: param.time, value: price });
        if (state.clicks.length === 2) {
          const [a, b] = [...state.clicks].sort((left, right) => left.time - right.time);
          if (active === "trend") trendSeries.setData([a, b]);
          if (active === "measure") {
            const delta = b.value - a.value;
            const pct = a.value ? (delta / a.value) * 100 : 0;
            onLegend({
              price: b.value,
              change: delta,
              pct,
              volume: barAt(param.time)?.volume ?? 0,
              blue: null,
              note: `Measure ${delta >= 0 ? "+" : ""}${formatPrice(delta, symbolRef.current)} (${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%)`,
            });
          }
          state.clicks = [];
        }
      }
      if (active === "hline") {
        const line = purpleSeries.createPriceLine({
          price,
          color: "#787b86",
          lineStyle: LineStyle.Dashed,
          lineWidth: 1,
          axisLabelVisible: true,
          title: "",
        });
        state.guides.push(line);
        state.clicks = [];
      }
      if (active === "erase") {
        trendSeries.setData([]);
        state.guides.forEach((line) => purpleSeries.removePriceLine(line));
        state.guides = [];
        state.clicks = [];
      }
    });

    api.current = state;
    return () => {
      chart.remove();
      api.current = null;
    };
  }, [onLegend]);

  useEffect(() => {
    const state = api.current;
    if (!state) return;
    state.bars = bars;
    state.blueSeries.setData(blue);
    state.purpleSeries.setData(purple);
    state.volumeSeries.setData(volume);
    const from = rangeStart(bars, range);
    const to = bars.at(-1)?.time;
    if (from != null && to != null && from < to) {
      try {
        state.chart.timeScale().setVisibleRange({ from, to });
      } catch {
        state.chart.timeScale().fitContent();
      }
    } else {
      state.chart.timeScale().fitContent();
    }
    const last = bars.at(-1);
    const prev = bars.at(-2);
    if (last && prev) {
      const change = last.close - prev.close;
      onLegend({
        price: last.close,
        change,
        pct: (change / prev.close) * 100,
        volume: last.volume,
        blue: blue.at(-1)?.value ?? null,
      });
    }
  }, [bars, blue, purple, volume, range, onLegend]);

  useEffect(() => {
    api.current?.chart.applyOptions({
      crosshair: { mode: tool === "magnet" ? CrosshairMode.Magnet : CrosshairMode.Normal },
    });
    if (api.current) api.current.clicks = [];
  }, [tool]);

  return <div ref={host} className="h-full w-full" />;
}
