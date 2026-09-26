import { useEffect, useRef } from "react";
import {
  ColorType,
  CrosshairMode,
  LastPriceAnimationMode,
  LineSeries,
  LineStyle,
  createChart,
} from "lightweight-charts";
import { rangeStart } from "./mockData.js";

const BLUE = "#4aa3df";
const PURPLE = "#9b4dca";

export default function PriceChart({ bars, blue, purple, range, symbol, onLegend }) {
  const host = useRef(null);
  const api = useRef(null);
  const symbolRef = useRef(symbol);
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
        scaleMargins: { top: 0.06, bottom: 0.06 },
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
    const state = { chart, blueSeries, purpleSeries };

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
          blue: blueValue.value,
        });
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
        blue: blue.at(-1)?.value ?? null,
      });
    }
  }, [bars, blue, purple, range, onLegend]);

  return <div ref={host} className="h-full w-full" />;
}
