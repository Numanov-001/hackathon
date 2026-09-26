import { useEffect, useMemo, useState } from "react";
import AccountPage from "./AccountPage";
import { DEFAULT_PREFS, loadPrefs, savePrefs, type AccountPrefs } from "./data/profile";
import { MOCK_SOURCE } from "./data/catalog";
import { buildOffers, type P2POffer, type P2PSide } from "./data/p2p";
import { fetchOffers } from "./data/supabaseApi";
import { hasSupabase } from "./lib/supabase";
import { productById } from "./data/products";
import { useSiatProducts } from "./hooks/useSiatProducts";
import { formatPrice } from "./lib/format";
import { priceUnit } from "./lib/unit";
import MarketOverview from "./MarketOverview";
import Navbar from "./Navbar";
import P2PBoard from "./P2PBoard";
import P2PSidebar from "./P2PSidebar";
import ProductTable from "./ProductTable";
import Toast from "./Toast";
import WelcomeSplash from "./WelcomeSplash";
import type { NavId, UserProfile } from "./types";

type DashboardProps = {
  clerkEnabled: boolean;
  isSignedIn: boolean;
  userName: string;
  userEmail: string;
  userPicture: string;
  openSignIn: () => void;
};

export default function Dashboard({
  clerkEnabled,
  isSignedIn,
  userName,
  userEmail,
  userPicture,
  openSignIn,
}: DashboardProps) {
  const { products, live } = useSiatProducts();
  const [section, setSection] = useState<NavId>("bozor");
  const [menuOpen, setMenuOpen] = useState(false);
  const [productId, setProductId] = useState("pomidor");
  const [prefs, setPrefs] = useState<AccountPrefs>(DEFAULT_PREFS);
  const [pending, setPending] = useState<NavId | "trade" | null>(null);
  const [pendingOffer, setPendingOffer] = useState<P2POffer | null>(null);
  const [side, setSide] = useState<P2PSide>("buy");
  const [p2pProduct, setP2pProduct] = useState("");
  const [p2pRegion, setP2pRegion] = useState("");
  const [p2pPayment, setP2pPayment] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [toast, setToast] = useState("");
  const [remoteOffers, setRemoteOffers] = useState<P2POffer[]>([]);

  const profile: UserProfile = {
    name: userName,
    email: userEmail,
    picture: userPicture,
    ...prefs,
  };

  const product = useMemo(() => productById(products, productId), [products, productId]);
  const localOffers = useMemo(() => buildOffers(products), [products]);
  const offers = remoteOffers.length ? remoteOffers : localOffers;
  const filtered = offers.filter((offer) => {
    if (side === "buy" ? offer.side !== "sell" : offer.side !== "buy") return false;
    if (p2pProduct && offer.productId !== p2pProduct) return false;
    if (p2pRegion && offer.region !== p2pRegion) return false;
    if (p2pPayment && offer.payment !== p2pPayment) return false;
    if (maxPrice && offer.price > Number(maxPrice)) return false;
    if (minQty && offer.available < Number(minQty)) return false;
    return true;
  });
  const kgOffers = offers.filter((item) => item.unit === "kg");
  const offerAvg = Math.round(kgOffers.reduce((sum, item) => sum + item.price, 0) / (kgOffers.length || 1));

  useEffect(() => {
    setPrefs(loadPrefs());
    fetchOffers().then((rows) => {
      if (rows.length) setRemoteOffers(rows);
    });
  }, []);

  useEffect(() => {
    if (!isSignedIn && (section === "obuna" || section === "profil")) {
      setSection("bozor");
    }
  }, [isSignedIn, section]);

  useEffect(() => {
    if (!isSignedIn || !pending) return;
    if (pending === "trade" && pendingOffer) finishTrade(pendingOffer);
    if (pending === "obuna" || pending === "profil") setSection(pending);
    setPending(null);
    setPendingOffer(null);
  }, [isSignedIn, pending, pendingOffer]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function askClerk() {
    if (clerkEnabled) {
      openSignIn();
      return;
    }
    showToast("Clerk kalitini frontend/.env ga qo‘ying: VITE_CLERK_PUBLISHABLE_KEY");
  }

  function openProduct(id: string) {
    setProductId(id);
    setP2pProduct(id);
    setSection("bozor");
    setMenuOpen(false);
  }

  function needAuth(next: NavId | "trade", offer?: P2POffer) {
    if (isSignedIn) return false;
    setPending(next);
    setPendingOffer(offer ?? null);
    askClerk();
    return true;
  }

  function goSection(id: NavId) {
    if ((id === "obuna" || id === "profil") && needAuth(id)) return;
    setSection(id);
    setMenuOpen(false);
  }

  function saveAccount() {
    savePrefs(prefs);
    showToast("Profil saqlandi.");
  }

  function finishTrade(offer: P2POffer) {
    showToast(`${offer.seller} · ${offer.productName} · ${formatPrice(offer.price)} ${priceUnit(offer.unit)}`);
  }

  function trade(offer: P2POffer) {
    if (needAuth("trade", offer)) return;
    finishTrade(offer);
  }

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
        Asosiy kontentga o‘tish
      </a>
      <WelcomeSplash />
      <Navbar
        section={section}
        onSection={goSection}
        menuOpen={menuOpen}
        onMenu={setMenuOpen}
        clerkEnabled={clerkEnabled}
        isSignedIn={isSignedIn}
        alerts={prefs.alerts}
        products={products}
        onOpenProduct={openProduct}
        onNeedClerk={askClerk}
      />
      <main id="main" className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-6">
        {section === "bozor" && (
          <MarketOverview
            products={products}
            product={product}
            live={live}
            onSelect={openProduct}
            onAll={() => setSection("mahsulotlar")}
          />
        )}
        {section === "mahsulotlar" && (
          <ProductTable products={products} onSelect={openProduct} />
        )}
        {section === "p2p" && (
          <div className="grid items-start gap-4 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <P2PSidebar offers={offers} avg={offerAvg} />
            </div>
            <div className="lg:col-span-8">
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
          </div>
        )}
        {section === "obuna" && isSignedIn && (
          <AccountPage
            mode="sozlamalar"
            profile={profile}
            onChange={(next) => setPrefs({ phone: next.phone, region: next.region, alerts: next.alerts, plan: next.plan })}
            onSave={saveAccount}
          />
        )}
        {section === "profil" && isSignedIn && (
          <AccountPage
            mode="profil"
            profile={profile}
            onChange={(next) => setPrefs({ phone: next.phone, region: next.region, alerts: next.alerts, plan: next.plan })}
            onSave={saveAccount}
          />
        )}
      </main>
      <footer className="mx-auto flex w-full max-w-[1440px] justify-between gap-4 px-4 pb-24 text-[13px] text-muted lg:px-6 lg:pb-8">
        <p>{MOCK_SOURCE.label}</p>
        <p>{MOCK_SOURCE.note}{hasSupabase() ? " · Supabase" : ""}</p>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-surface lg:hidden" aria-label="Pastki menyu">
        {[
          ["bozor", "Bozor"],
          ["p2p", "P2P"],
          ["mahsulotlar", "Mahsulotlar"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id as NavId)}
            className={`min-h-12 py-3 text-xs font-semibold ${section === id ? "text-accent" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <Toast message={toast} />
    </div>
  );
}
