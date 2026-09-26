import { useEffect, useRef } from "react";
import {
  ColorType,
  CrosshairMode,
  LineSeries,
  LineStyle,
  createChart,
} from "lightweight-charts";
import { rangeStart } from "../tv/mockData.js";

const LINE = "#146b43";

export default function PriceLine({ bars, range, metric }) {
  const host = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    const chart = createChart(host.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#fffcf8" },
        textColor: "#4e5a54",
        fontSize: 13,
        fontFamily: '"Source Sans 3", system-ui, sans-serif',
      },
      localization: { locale: "uz-UZ" },
      grid: {
        vertLines: { color: "#e8e2d6", style: LineStyle.Solid },
        horzLines: { color: "#e8e2d6", style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#b7afa0", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#163028" },
        horzLine: { color: "#b7afa0", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#163028" },
      },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.12, bottom: 0.08 } },
      timeScale: { borderVisible: false, rightOffset: 6 },
    });
    const series = chart.addSeries(LineSeries, {
      color: LINE,
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerRadius: 5,
    });
    api.current = { chart, series };
    return () => {
      chart.remove();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    const state = api.current;
    if (!state) return;
    const points = bars.map((bar) => ({
      time: bar.time,
      value: metric === "volume" ? bar.volume : bar.close,
    }));
    state.series.setData(points);
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
  }, [bars, range, metric]);

  return <div ref={host} className="desk-chart-host" />;
}
