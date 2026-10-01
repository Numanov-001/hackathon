import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, CreditCard, Package, Store } from "lucide-react";
import AccountPage from "./AccountPage";
import { DEFAULT_PREFS, loadPrefs, savePrefs, type AccountPrefs } from "./data/profile";
import { type P2POffer, type P2PSide } from "./data/p2p";
import { productById } from "./data/products";
import { fetchVipStatus, upsertSignedProfile } from "./data/supabaseApi";
import { useDeskOffers, type DeskOfferDraft } from "./hooks/useDeskOffers";
import { useSiatProducts } from "./hooks/useSiatProducts";
import { postJson } from "../api/client";
import { formatPrice } from "./lib/format";
import { priceUnit } from "./lib/unit";
import MarketOverview from "./MarketOverview";
import Navbar from "./Navbar";
import P2PBoard from "./P2PBoard";
import ProductTable from "./ProductTable";
import Toast from "./Toast";
import WelcomeSplash from "./WelcomeSplash";
import PremiumModal from "./PremiumModal";
import type { AccessRole, NavId, PlanId, UserProfile } from "./types";

const PLANS: PlanId[] = ["free", "starter", "business", "premium_monthly", "premium_yearly"];

function asPlan(value: unknown): PlanId {
  return PLANS.includes(value as PlanId) ? (value as PlanId) : "free";
}

type DashboardProps = {
  clerkEnabled: boolean;
  isSignedIn: boolean;
  userName: string;
  userEmail: string;
  userPicture: string;
  clerkUserId?: string;
  openSignIn: () => void;
  getToken?: () => Promise<string | null>;
};

export default function Dashboard({
  clerkEnabled,
  isSignedIn,
  userName,
  userEmail,
  userPicture,
  clerkUserId = "",
  openSignIn,
  getToken,
}: DashboardProps) {
  const { products, live, loading, error, reload, message2020 } = useSiatProducts();
  const [plan, setPlan] = useState<PlanId>("free");
  const [premium, setPremium] = useState(false);
  const [role, setRole] = useState<AccessRole>("user");
  const [expiry, setExpiry] = useState<string | null>(null);
  const [trial, setTrial] = useState(false);
  const [promoUntil, setPromoUntil] = useState<string | null>(null);
  const [cardLast4, setCardLast4] = useState("");
  const [lockOpen, setLockOpen] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const { offers, publish } = useDeskOffers(products, getToken, plan);
  const [section, setSection] = useState<NavId>("bozor");
  const [menuOpen, setMenuOpen] = useState(false);
  const [productId, setProductId] = useState("pomidor");
  const [prefs, setPrefs] = useState<AccountPrefs>(DEFAULT_PREFS);
  const [pending, setPending] = useState<NavId | "trade" | "post" | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<P2POffer | null>(null);
  const [side, setSide] = useState<P2PSide>("buy");
  const [p2pProduct, setP2pProduct] = useState("pomidor");
  const [p2pRegion, setP2pRegion] = useState("");
  const [p2pPayment, setP2pPayment] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [toast, setToast] = useState("");
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const profile: UserProfile = {
    name: userName,
    email: userEmail,
    picture: userPicture,
    phone: prefs.phone,
    region: prefs.region,
    alerts: prefs.alerts,
    plan,
    premium,
    role,
    subscriptionExpiry: expiry,
    trial,
    promoUntil,
    cardLast4,
  };
  const contacts = premium;

  const product = useMemo(() => productById(products, productId), [products, productId]);
  const filtered = offers.filter((offer) => {
    if (side === "buy" ? offer.side !== "sell" : offer.side !== "buy") return false;
    if (p2pProduct && offer.productId !== p2pProduct) return false;
    if (p2pRegion && offer.region !== p2pRegion) return false;
    if (p2pPayment && offer.payment !== p2pPayment) return false;
    if (maxPrice && offer.price > Number(maxPrice)) return false;
    if (minQty && offer.available < Number(minQty)) return false;
    return true;
  }).sort((a, b) => a.price - b.price);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setPlan("free");
      setPremium(false);
      setRole("user");
      setExpiry(null);
      setTrial(false);
      setPromoUntil(null);
      setCardLast4("");
      setPlanReady(true);
      return;
    }
    let cancel = false;
    setPlanReady(false);
    (async () => {
      try {
        const token = getTokenRef.current ? await getTokenRef.current() : null;
        const row = (await postJson("/api/desk/session", { name: userName, email: userEmail }, token)) as {
          plan?: PlanId;
          premium?: boolean;
          role?: AccessRole;
          end_date?: string | null;
          trial?: boolean;
          promo_until?: string | null;
          card_last4?: string;
        };
        if (cancel) return;
        setPlan(asPlan(row.plan));
        setPremium(Boolean(row.premium));
        setRole(row.role === "admin" ? "admin" : "user");
        setExpiry(row.end_date ?? null);
        setTrial(Boolean(row.trial));
        setPromoUntil(row.promo_until ?? null);
        setCardLast4(row.card_last4 ?? "");
      } catch {
        if (!cancel) {
          setPlan("free");
          setPremium(false);
        }
      }
      if (!cancel && clerkUserId) {
        await upsertSignedProfile({
          clerkId: clerkUserId,
          name: userName,
          email: userEmail,
          picture: userPicture,
          phone: prefs.phone,
          region: prefs.region,
        });
        const vip = await fetchVipStatus(clerkUserId);
        if (!cancel && vip.vip) {
          setPremium(true);
          setPlan("starter");
          if (vip.until) setExpiry(vip.until);
        }
      }
      if (!cancel) setPlanReady(true);
    })();
    return () => {
      cancel = true;
    };
  }, [isSignedIn, userName, userEmail, userPicture, clerkUserId, prefs.phone, prefs.region]);

  useEffect(() => {
    if (!isSignedIn && (section === "obuna" || section === "profil")) {
      setSection("bozor");
    }
  }, [isSignedIn, section]);

  useEffect(() => {
    if (!isSignedIn || !pending || !planReady) return;
    if (pending === "trade" && pendingOffer) finishTrade(pendingOffer);
    if (pending === "post") {
      if (premium) setPostOpen(true);
      else {
        setSection("obuna");
        showToast("E’lon qo‘yish Premium obunada.");
      }
    }
    if (pending === "obuna" || pending === "profil") setSection(pending);
    setPending(null);
    setPendingOffer(null);
  }, [isSignedIn, pending, pendingOffer, plan, planReady]);

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

  function needAuth(next: NavId | "trade" | "post", offer?: P2POffer) {
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

  function openPost() {
    if (needAuth("post")) return;
    if (!contacts) {
      setSection("obuna");
      showToast("E’lon qo‘yish Premium obunada.");
      return;
    }
    setPostOpen(true);
  }

  async function choosePlan(next: PlanId) {
    const read = getTokenRef.current;
    if (!read) return;
    try {
      const token = await read();
      const row = (await postJson("/api/desk/plan", { plan: next }, token)) as {
        plan?: PlanId;
        premium?: boolean;
        message?: string;
        end_date?: string | null;
        trial?: boolean;
        promo_until?: string | null;
      };
      setPlan(asPlan(row.plan));
      setPremium(Boolean(row.premium));
      setExpiry(row.end_date ?? null);
      setTrial(Boolean(row.trial));
      setPromoUntil(row.promo_until ?? null);
      showToast(row.message || "So‘rov yuborildi.");
    } catch (err) {
      showToast(err instanceof Error && err.message ? err.message : "Tarif ochilmadi.");
    }
  }

  async function publishAd(draft: DeskOfferDraft) {
    await publish(draft);
    setSide(draft.side === "sell" ? "buy" : "sell");
    setP2pProduct(draft.productId);
    setPostOpen(false);
    showToast("E’lon joylandi. Telefoningiz ro‘yxatda ko‘rinadi.");
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
        products={products}
        offers={offers}
        onOpenProduct={openProduct}
        onOpenP2P={() => goSection("p2p")}
        onNeedClerk={askClerk}
        isAdmin={role === "admin"}
        onAdmin={() => { window.history.pushState({}, "", "/admin"); window.dispatchEvent(new PopStateEvent("popstate")); }}
      />
      <main id="main" className="mx-auto w-full max-w-[1440px] px-3 py-4 pb-28 sm:px-4 sm:py-6 lg:px-6 lg:pb-8">
        {section === "bozor" && (
          <MarketOverview
            products={products}
            product={product}
            live={live}
            loading={loading}
            error={error}
            onRetry={reload}
            onSelect={openProduct}
            onAll={() => setSection("mahsulotlar")}
            plan={plan}
            premium={premium}
            isSignedIn={isSignedIn}
            getToken={getToken}
            onNeedAuth={askClerk}
            onNeedPlan={() => setLockOpen(true)}
            message2020={message2020}
            offers={offers}
            contacts={contacts}
            onOpenP2P={() => setSection("p2p")}
          />
        )}
        {section === "mahsulotlar" && (
          <ProductTable products={products} loading={loading} error={error} onRetry={reload} onSelect={openProduct} />
        )}
        {section === "p2p" && (
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
            postOpen={postOpen}
            onPost={openPost}
            onClosePost={() => setPostOpen(false)}
            posterName={profile.name}
            posterPhone={profile.phone}
            contacts={contacts}
            advice={premium}
            onUnlock={() => goSection("obuna")}
            onPublish={publishAd}
          />
        )}
        {section === "obuna" && isSignedIn && (
          <AccountPage
            mode="obuna"
            profile={profile}
            onChange={(next) => setPrefs({ phone: next.phone, region: next.region, alerts: next.alerts, plan: "free" })}
            onSave={saveAccount}
            onChoosePlan={choosePlan}
            onCustom={() => showToast("Custom tarif kelishuv bilan. Hozir ochilmaydi.")}
          />
        )}
        {section === "profil" && isSignedIn && (
          <AccountPage
            mode="profil"
            profile={profile}
            onChange={(next) => setPrefs({ phone: next.phone, region: next.region, alerts: next.alerts, plan: "free" })}
            onSave={saveAccount}
          />
        )}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Pastki menyu">
        {([
          ["bozor", "Bozor", Store],
          ["p2p", "P2P", ArrowLeftRight],
          ["mahsulotlar", "Tovarlar", Package],
          ["obuna", "Obuna", CreditCard],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => goSection(id)}
            className={`inline-flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${section === id ? "text-accent" : "text-muted"}`}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      <PremiumModal
        open={lockOpen}
        onClose={() => setLockOpen(false)}
        onUpgrade={() => {
          setLockOpen(false);
          goSection("obuna");
        }}
      />
      <Toast message={toast} />
    </div>
  );
}
