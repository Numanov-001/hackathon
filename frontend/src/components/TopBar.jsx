export default function TopBar({
  products,
  regions,
  product,
  region,
  timeframe,
  live,
  search,
  onSearch,
  onSubmitSearch,
  onProduct,
  onRegion,
  onTimeframe,
  onCreate,
  onMenu,
}) {
  return (
    <header className="topbar">
      <button className="btn menu-btn" onClick={onMenu}>Menu</button>
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitSearch();
        }}
      >
        <label className="control">
          Search
          <input
            className="search"
            placeholder="Tomato, potato, pomidor"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>
      </form>
      <label className="control">
        Product
        <select value={product} onChange={(e) => onProduct(e.target.value)}>
          {products.map((item) => (
            <option key={item.id} value={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <label className="control">
        Region
        <select value={region} onChange={(e) => onRegion(e.target.value)}>
          <option value="">All regions</option>
          {regions.map((item) => (
            <option key={item.id} value={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <div className="control">
        Timeframe
        <div className="tf" role="group" aria-label="Timeframe">
          {["1D", "1W", "1M", "3M", "1Y"].map((item) => (
            <button
              key={item}
              type="button"
              className={timeframe === item ? "active" : ""}
              aria-pressed={timeframe === item}
              onClick={() => onTimeframe(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <span className={`live ${live ? "" : "off"}`}><span className="dot" aria-hidden="true" /> {live ? "Live" : "Offline"}</span>
      <button className="btn primary" onClick={onCreate}>Publish intention</button>
    </header>
  );
}
