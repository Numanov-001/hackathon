export default function P2PFilters({ regions, filters, onChange, onReset }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }
  return (
    <div className="filters">
      <label className="field">
        Region
        <select value={filters.region} onChange={(e) => set("region", e.target.value)}>
          <option value="">All regions</option>
          {regions.map((item) => (
            <option key={item.id} value={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Type
        <select value={filters.type} onChange={(e) => set("type", e.target.value)}>
          <option value="">Ask and bid</option>
          <option value="ASK">Ask (sell)</option>
          <option value="BID">Bid (buy)</option>
        </select>
      </label>
      <label className="field">
        Minimum price
        <input type="number" min="0" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} />
      </label>
      <label className="field">
        Minimum volume (kg)
        <input type="number" min="0" value={filters.minVolume} onChange={(e) => set("minVolume", e.target.value)} />
      </label>
      <button className="btn" type="button" onClick={onReset}>Reset filters</button>
    </div>
  );
}
