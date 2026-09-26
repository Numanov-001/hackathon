import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowLeftRight, BarChart3, LineChart, TrendingUp } from "lucide-react";
import AccountPage from "./AccountPage";
import AdminPanel from "./AdminPanel";
import { applyImages, loadImages, saveImages } from "./data/media";
import { DEFAULT_PROFILE, loadProfile, saveProfile } from "./data/profile";
import { SIAT_SOURCE } from "./data/siat";
import { market2025 } from "./data/siat2025";
import { buildOffers, type P2POffer, type P2PSide } from "./data/p2p";
import { productById } from "./data/products";
import { useSiatProducts } from "./hooks/useSiatProducts";
import { formatPrice, signedPct } from "./lib/format";
import KpiCard from "./KpiCard";
import Navbar from "./Navbar";
import P2PBoard from "./P2PBoard";
import P2PSidebar from "./P2PSidebar";
import PriceChartCard from "./PriceChart";
import PriceSummary from "./PriceSummary";
import Sidebar from "./Sidebar";
import Stats2025 from "./Stats2025";
import Toast from "./Toast";
import WelcomeSplash from "./WelcomeSplash";
import YearCompare from "./YearCompare";
import type { NavId, UserProfile } from "./types";

export default function Dashboard() {
  const { base, products, setProducts } = useSiatProducts();
  const [section, setSection] = useState<NavId>("bozor");
  const [menuOpen, setMenuOpen] = useState(false);
  const [productId, setProductId] = useState("pomidor");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [side, setSide] = useState<P2PSide>("buy");
  const [p2pProduct, setP2pProduct] = useState("pomidor");
  const [p2pRegion, setP2pRegion] = useState("");
  const [p2pPayment, setP2pPayment] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [toast, setToast] = useState("");

  const product = useMemo(() => productById(products, productId), [products, productId]);
  const stats = useMemo(() => market2025(), []);
  const offers = useMemo(() => buildOffers(products), [products]);
  const filtered = offers.filter((offer) => {
    if (side === "buy" ? offer.side !== "sell" : offer.side !== "buy") return false;
    if (p2pProduct && offer.productId !== p2pProduct) return false;
    if (p2pRegion && offer.region !== p2pRegion) return false;
    if (p2pPayment && offer.payment !== p2pPayment) return false;
    if (maxPrice && offer.price > Number(maxPrice)) return false;
    if (minQty && offer.available < Number(minQty)) return false;
    return true;
  });
  const offerAvg = Math.round(offers.reduce((sum, item) => sum + item.price, 0) / (offers.length || 1));

  useEffect(() => {
    const saved = loadProfile();
    setProfile(saved);
  }, []);

  const showAccount = section === "obuna" || section === "sozlamalar";
  const showAdmin = section === "profil";
  const showMarket = !showAccount && !showAdmin && (section === "bozor" || section === "mahsulotlar");
  const showP2P = !showAccount && !showAdmin && (section === "bozor" || section === "p2p");

  function updateImage(id: string, dataUrl: string) {
    const next = { ...loadImages(), [id]: dataUrl };
    saveImages(next);
    setProducts(applyImages(base, next));
    setToast("Rasm saqlandi. Keyin Supabase ga ko‘chiramiz.");
    window.setTimeout(() => setToast(""), 2200);
  }

  function resetImage(id: string) {
    const next = { ...loadImages() };
    delete next[id];
    saveImages(next);
    setProducts(applyImages(base, next));
    setToast("Standart rasm qaytarildi.");
    window.setTimeout(() => setToast(""), 2200);
  }

  function saveAccount() {
    saveProfile(profile);
    setToast("Profil saqlandi.");
    window.setTimeout(() => setToast(""), 2200);
  }

  function logout() {
    const guest: UserProfile = { ...DEFAULT_PROFILE, name: "Mehmon", phone: "", email: "", role: "Xaridor", plan: "free" };
    setProfile(guest);
    saveProfile(guest);
    setSection("bozor");
    setToast("Hisobdan chiqildi.");
    window.setTimeout(() => setToast(""), 2200);
  }

  function trade(offer: P2POffer) {
    setToast(`${offer.seller} · ${offer.productName} · ${formatPrice(offer.price)} UZS/kg`);
    window.setTimeout(() => setToast(""), 2400);
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-transparent text-[#14213D]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[url('/veg-bg.jpg')] bg-cover bg-center bg-fixed" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#F7FAF8]/80" aria-hidden="true" />
      <WelcomeSplash />
      <Navbar
        section={section}
        onSection={setSection}
        menuOpen={menuOpen}
        onMenu={setMenuOpen}
        profile={profile}
        products={products}
        onProfile={() => setSection("profil")}
        onSettings={() => setSection("obuna")}
        onLogout={logout}
        onOpenProduct={(id) => { setProductId(id); setP2pProduct(id); setSection("bozor"); }}
      />
      <main className="relative mx-auto w-full max-w-[1920px] px-4 py-8 lg:px-10">
        <div key={section} className="grid grid-cols-12 items-stretch gap-6">
          {showAccount && (
            <div className="enter col-span-12" style={{ "--enter": "80ms" } as CSSProperties}>
              <AccountPage
                mode="sozlamalar"
                profile={profile}
                onChange={setProfile}
                onSave={saveAccount}
              />
            </div>
          )}
          {showAdmin && (
            <div className="enter col-span-12" style={{ "--enter": "80ms" } as CSSProperties}>
              <AdminPanel products={products} onImage={updateImage} onReset={resetImage} />
            </div>
          )}

          {showP2P && (
            <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard delay={80} icon={ArrowLeftRight} title="Faol P2P e’lonlar" value={String(offers.length)} trend={`${filtered.length} ta mos`} trendTone="neutral" />
              <KpiCard delay={140} icon={BarChart3} title="Bugungi savdolar" value="86" trend="+14 ta" />
              <KpiCard delay={200} icon={LineChart} title="O‘rtacha narx" value={`${formatPrice(offerAvg)} UZS/kg`} trend={`${formatPrice(stats.avg)} · 2025`} trendTone="neutral" />
              <KpiCard
                delay={260}
                icon={TrendingUp}
                title="2025 yil o‘sishi"
                value={signedPct(stats.growth)}
                trend={stats.topUp.name}
                trendTone={stats.growth >= 0 ? "up" : "down"}
              />
            </div>
          )}

          {showMarket && (
            <div className="enter col-span-12 grid gap-6 lg:col-span-8" style={{ "--enter": "180ms" } as CSSProperties}>
              <PriceSummary product={product} />
              <PriceChartCard product={product} />
              <YearCompare productId={product.id} productName={product.name} />
              <Stats2025 productId={product.id} />
            </div>
          )}
          {showMarket && (
            <div className="enter col-span-12 grid gap-6 lg:col-span-4" style={{ "--enter": "260ms" } as CSSProperties}>
              <Sidebar
                products={products}
                selectedId={product.id}
                onSelect={(id) => { setProductId(id); setP2pProduct(id); setSection("bozor"); }}
                onAll={() => setSection("mahsulotlar")}
              />
              <P2PSidebar offers={offers} avg={offerAvg} />
            </div>
          )}

          {section === "p2p" && (
            <div className="enter col-span-12 lg:col-span-4" style={{ "--enter": "180ms" } as CSSProperties}>
              <P2PSidebar offers={offers} avg={offerAvg} />
            </div>
          )}
          {section === "p2p" && (
            <div className="enter col-span-12 grid gap-6 lg:col-span-8" style={{ "--enter": "240ms" } as CSSProperties}>
              <YearCompare productId={p2pProduct || product.id} productName={product.name} />
              <Stats2025 productId={p2pProduct || product.id} />
            </div>
          )}

          {showP2P && (
            <div className="enter col-span-12" style={{ "--enter": "320ms" } as CSSProperties}>
              <P2PBoard
                side={side}
                onSide={setSide}
                productId={p2pProduct}
                onProduct={(id) => { setP2pProduct(id); if (id) setProductId(id); }}
                region={p2pRegion}
                onRegion={setP2pRegion}
                payment={p2pPayment}
                onPayment={setP2pPayment}
                maxPrice={maxPrice}
                onMaxPrice={setMaxPrice}
                minQty={minQty}
                onMinQty={setMinQty}
                products={products}
                offers={filtered}
                onTrade={trade}
              />
            </div>
          )}
        </div>
      </main>
      <footer className="relative mx-auto flex w-full max-w-[1920px] justify-between gap-4 px-4 pb-24 text-xs text-[#667085] lg:px-10 lg:pb-8">
        <p>{SIAT_SOURCE.label}</p>
        <p>SIAT 1329 · 1 kg so‘mda</p>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[#E4E7EC] bg-white lg:hidden" aria-label="Pastki menyu">
        {[
          ["bozor", "Bozor"],
          ["p2p", "P2P"],
          ["mahsulotlar", "Mahsulotlar"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id as NavId)}
            className={`py-3 text-xs font-semibold ${section === id ? "text-[#087A45]" : "text-[#667085]"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <Toast message={toast} />
    </div>
  );
}
