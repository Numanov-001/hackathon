export default function ChartToolbar({ regions, enabled, onToggle, tab, onTab }) {
  return (
    <div className="chart-toolbar">
      <div className="tabs" role="tablist" aria-label="Market view">
        <button type="button" role="tab" aria-selected={tab === "chart"} className={tab === "chart" ? "active" : ""} onClick={() => onTab("chart")}>Chart</button>
        <button type="button" role="tab" aria-selected={tab === "table"} className={tab === "table" ? "active" : ""} onClick={() => onTab("table")}>Table</button>
        <button type="button" role="tab" aria-selected={tab === "analytics"} className={tab === "analytics" ? "active" : ""} onClick={() => onTab("analytics")}>Summary</button>
      </div>
      <div className="regions">
        {regions.map((name) => (
          <label key={name}>
            <input
              type="checkbox"
              checked={enabled.includes(name)}
              onChange={() => onToggle(name)}
            />
            {name}
          </label>
        ))}
      </div>
    </div>
  );
}
