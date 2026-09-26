import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { ChartPoint } from "./types";

type MiniSparkProps = {
  data: ChartPoint[];
  up: boolean;
  label: string;
};

export default function MiniSpark({ data, up, label }: MiniSparkProps) {
  const points = data.filter((point) => point.price > 0);
  const color = up ? "#0E6B3C" : "#9B1C1C";
  const fillId = `spark-${label.replace(/\s+/g, "-")}`;

  if (points.length < 2) {
    return <div className="h-12 w-full rounded-md bg-subtle" aria-hidden="true" />;
  }

  return (
    <div className="h-12 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="linear"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${fillId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
