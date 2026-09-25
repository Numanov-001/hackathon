import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartChrome, seriesColors } from "../tokens.js";

export default function PriceChart({ history }) {
  if (!history?.regions?.length) {
    return <div className="empty">No median ask prices for this filter. Turn a region back on, or choose a longer timeframe.</div>;
  }

  const dates = [...new Set(history.regions.flatMap((region) => region.data.map((d) => d.date)))].sort();
  const rows = dates.map((date) => {
    const row = { date };
    history.regions.forEach((region) => {
      const point = region.data.find((item) => item.date === date);
      row[region.region] = point ? Number(point.median_price) : null;
      row[`${region.region}Source`] = point?.source;
    });
    return row;
  });

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartChrome.grid} />
          <XAxis dataKey="date" minTickGap={28} stroke={chartChrome.axis} tick={{ fontSize: 13, fill: chartChrome.axis }} />
          <YAxis
            stroke={chartChrome.axis}
            tick={{ fontSize: 13, fill: chartChrome.axis }}
            width={56}
            domain={[(min) => Math.floor(min * 0.97), (max) => Math.ceil(max * 1.03)]}
          />
          <Tooltip
            contentStyle={{
              background: chartChrome.tooltipBg,
              border: `1px solid ${chartChrome.tooltipBorder}`,
              borderRadius: 6,
              fontSize: 14,
              color: chartChrome.tooltipText,
            }}
            formatter={(value, name) => [`${Number(value).toLocaleString()} UZS`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {history.regions.map((region, index) => (
            <Line
              key={region.region}
              type="linear"
              dataKey={region.region}
              stroke={seriesColors[index % seriesColors.length]}
              strokeWidth={1.25}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
