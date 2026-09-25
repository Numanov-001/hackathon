import { useEffect, useMemo, useState } from "react";
import { getJson } from "./api/client";
import AIAssistant from "./components/AIAssistant.jsx";
import ChartToolbar from "./components/ChartToolbar.jsx";
import CreateIntentionModal from "./components/CreateIntentionModal.jsx";
import ForecastPanel from "./components/ForecastPanel.jsx";
import LiveFeed from "./components/LiveFeed.jsx";
import MarketHeader from "./components/MarketHeader.jsx";
import MarketTicker from "./components/MarketTicker.jsx";
import P2PFilters from "./components/P2PFilters.jsx";
import P2PTable from "./components/P2PTable.jsx";
import PriceChart from "./components/PriceChart.jsx";
import RecommendationList from "./components/RecommendationList.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import { useLiveFeed } from "./hooks/useLiveFeed.js";
import { useMarket } from "./hooks/useMarket.js";
import { filterHistory, lastLiveMedian } from "./utils/format.js";

const EMPTY_FILTERS = { region: "", type: "", minPrice: "", minVolume: "" };

export default function App() {
  const [product, setProduct] = useState("Tomato");
  const [region, setRegion] = useState("");
  const [timeframe, setTimeframe] = useState("3M");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("markets");
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [enabledRegions, setEnabledRegions] = useState([]);
  const [toast, setToast] = useState("");
  const [chartTab, setChartTab] = useState("chart");

  const market = useMarket(product, region);
  const { events, live } = useLiveFeed(market.reload);

  const regionNames = market.history?.regions.map((item) => item.region) || [];
  useEffect(() => {
    if (regionNames.length) setEnabledRegions(regionNames);
  }, [regionNames.join("|")]);

  const chartHistory = useMemo(
    () => filterHistory(market.history, timeframe, enabledRegions.length ? enabledRegions : regionNames),
    [market.history, timeframe, enabledRegions, regionNames],
  );

  const lastPrice = lastLiveMedian(market.history, region || null) ?? Number(market.summary?.best_ask);
  const change = market.forecast
    ? (Number(market.forecast.pct_change_low) + Number(market.forecast.pct_change_high)) / 2
    : null;

  const askVolume = market.offers
    .filter((item) => item.order_type === "ASK")
    .reduce((sum, item) => sum + Number(item.volume || 0), 0);

  const filteredOffers = market.offers.filter((item) => {
    if (filters.region && item.region !== filters.region) return false;
    if (filters.type && item.order_type !== filters.type) return false;
    if (filters.minPrice && Number(item.price) < Number(filters.minPrice)) return false;
    if (filters.minVolume && Number(item.volume) < Number(filters.minVolume)) return false;
    return true;
  });

  function toggleRegion(name) {
    setEnabledRegions((current) => {
      if (current.includes(name) && current.length === 1) return current;
      return current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
    });
  }

  async function submitSearch() {
    if (!search.trim()) return;
    const result = await getJson(`/api/search?q=${encodeURIComponent(search.trim())}`);
    if (result.product) setProduct(result.product);
  }

  function go(id) {
    setSection(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className={`shell ${collapsed ? "collapsed" : ""}`}>
      <div className={`backdrop ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)} />
      <Sidebar
        collapsed={collapsed && !menuOpen}
        open={menuOpen}
        section={section}
        onSection={go}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <main className="workspace">
        <TopBar
          products={market.products}
          regions={market.regions}
          product={product}
          region={region}
          timeframe={timeframe}
          live={live}
          search={search}
          onSearch={setSearch}
          onSubmitSearch={submitSearch}
          onProduct={setProduct}
          onRegion={setRegion}
          onTimeframe={setTimeframe}
          onCreate={() => setModal(true)}
          onMenu={() => setMenuOpen(true)}
        />
        <MarketTicker
          items={market.ticker}
          historyByProduct={{ [product]: { pct: change } }}
        />
        <div className="board">
        <MarketHeader
          product={product}
          unit={market.summary?.unit}
          summary={market.summary}
          lastPrice={lastPrice}
          change={change}
          forecast={market.forecast}
          askVolume={askVolume}
          history={chartHistory}
        />
        <div className="content">
          <section className="chart-pane card" id="markets" aria-labelledby="markets-title">
            <div className="pane-head">
              <div>
                <h2 id="markets-title">Markets</h2>
                <p>Median ask price by region.</p>
              </div>
            </div>
            {market.loading && <div className="empty" role="status">Loading market prices…</div>}
            {market.error && <div className="empty bid" role="alert">We couldn’t load this market. Refresh the page and try again.</div>}
            <ChartToolbar
              regions={regionNames}
              enabled={enabledRegions}
              onToggle={toggleRegion}
              tab={chartTab}
              onTab={(next) => {
                setChartTab(next);
                if (next === "table") go("p2p");
                if (next === "analytics") go("analytics");
              }}
            />
            {chartTab !== "table" && <PriceChart history={chartHistory} />}
            <p className="disclaimer">{market.history?.disclaimer}</p>
          </section>
          <aside className="rail">
            <LiveFeed events={events} />
            <RecommendationList offers={market.recommendations} median={lastPrice} />
            <ForecastPanel forecast={market.forecast} />
            <AIAssistant />
          </aside>
        </div>
        <section className="p2p card" id="p2p" aria-labelledby="intentions-title">
          <div className="p2p-intro">
            <h2 id="intentions-title">Intentions</h2>
            <p>Buy and sell offers. These are intentions, not completed trades.</p>
          </div>
          <P2PFilters
            regions={market.regions}
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(EMPTY_FILTERS)}
          />
          <P2PTable offers={filteredOffers} />
        </section>
        </div>
      </main>
      {modal && (
        <CreateIntentionModal
          products={market.products}
          regions={market.regions}
          users={market.users}
          defaults={{ product, region }}
          onClose={() => setModal(false)}
          onCreated={() => {
            market.reload();
            setToast("Intention published. It now appears in the intentions list.");
            setTimeout(() => setToast(""), 2200);
          }}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
