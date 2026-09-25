import { useCallback, useEffect, useState } from "react";
import { getJson } from "../api/client";

export function useMarket(product, region) {
  const [products, setProducts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [history, setHistory] = useState(null);
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [ticker, setTicker] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTicker = useCallback(async (catalog) => {
    if (!catalog?.length) return;
    const rows = await Promise.all(
      catalog.map(async (item) => {
        try {
          const data = await getJson(`/api/market/${item.name}/summary`);
          return { product: item.name, bestAsk: data.best_ask, asks: data.active_asks, bids: data.active_bids };
        } catch {
          return { product: item.name, bestAsk: null, asks: 0, bids: 0 };
        }
      }),
    );
    setTicker(rows);
  }, []);

  const loadCatalog = useCallback(async () => {
    const [nextProducts, nextRegions, nextUsers] = await Promise.all([
      getJson("/api/products"),
      getJson("/api/regions"),
      getJson("/api/users"),
    ]);
    setProducts(nextProducts);
    setRegions(nextRegions);
    setUsers(nextUsers);
    return nextProducts;
  }, []);

  const loadMarket = useCallback(async (catalog) => {
    const list = catalog || products;
    if (!product || !list.length) return;
    setError("");
    const selected = list.find((item) => item.name === product);
    const query = region ? `?region=${encodeURIComponent(region)}` : "";
    const offerQuery = selected ? `?product_id=${selected.id}` : "";
    try {
      const [nextOffers, nextHistory, nextSummary, nextForecast, nextRecs] = await Promise.all([
        getJson(`/api/offers${offerQuery}`),
        getJson(`/api/market/${product}/history${query}`),
        getJson(`/api/market/${product}/summary${query}`),
        getJson(`/api/forecast/${product}${query}`),
        getJson(`/api/recommendations?product=${encodeURIComponent(product)}${region ? `&region=${encodeURIComponent(region)}` : ""}`),
      ]);
      setOffers(nextOffers);
      setHistory(nextHistory);
      setSummary(nextSummary);
      setForecast(nextForecast);
      setRecommendations(nextRecs.offers || []);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }, [product, region, products]);

  useEffect(() => {
    loadCatalog()
      .then((catalog) => {
        loadTicker(catalog);
        return catalog;
      })
      .catch((err) => setError(String(err.message || err)));
  }, [loadCatalog, loadTicker]);

  useEffect(() => {
    if (!products.length) return;
    loadMarket(products);
  }, [loadMarket, products]);

  const reload = useCallback(() => {
    loadMarket(products);
    loadTicker(products);
  }, [loadMarket, loadTicker, products]);

  return {
    products,
    regions,
    users,
    offers,
    history,
    summary,
    forecast,
    recommendations,
    ticker,
    loading,
    error,
    reload,
  };
}
