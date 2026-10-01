import { SignInButton, UserButton } from "@clerk/react";
import { clerkAppearance } from "./clerkAppearance";
import { ArrowLeftRight, CreditCard, Menu, Package, Store, UserRound, X } from "lucide-react";
import Logo from "./Logo";
import ProductSearch from "./ProductSearch";
import { cn } from "./lib/cn";
import { BRAND_NAME } from "./data/brand";
import type { NavId, Product } from "./types";
import type { P2POffer } from "./data/p2p";

const ITEMS: Array<{ id: NavId; label: string; icon: typeof Store }> = [
  { id: "bozor", label: "Bozor", icon: Store },
  { id: "p2p", label: "P2P", icon: ArrowLeftRight },
  { id: "mahsulotlar", label: "Mahsulotlar", icon: Package },
];
const ACCOUNT_ITEMS: Array<{ id: NavId; label: string; icon: typeof Store }> = [
  { id: "obuna", label: "Obuna", icon: CreditCard },
];

type NavbarProps = {
  section: NavId;
  onSection: (id: NavId) => void;
  menuOpen: boolean;
  onMenu: (open: boolean) => void;
  clerkEnabled: boolean;
  isSignedIn: boolean;
  products: Product[];
  offers?: P2POffer[];
  onOpenProduct: (id: string) => void;
  onOpenP2P?: () => void;
  onNeedClerk: () => void;
  isAdmin?: boolean;
  onAdmin?: () => void;
};

function KirishButton({
  clerkEnabled,
  onNeedClerk,
  className,
  onAfterClick,
}: {
  clerkEnabled: boolean;
  onNeedClerk: () => void;
  className: string;
  onAfterClick?: () => void;
}) {
  const button = (
    <button
      type="button"
      onClick={() => {
        if (!clerkEnabled) onNeedClerk();
        onAfterClick?.();
      }}
      className={className}
    >
      Kirish
    </button>
  );

  if (!clerkEnabled) return button;
  return (
    <SignInButton mode="modal" appearance={clerkAppearance}>
      {button}
    </SignInButton>
  );
}

export default function Navbar({
  section,
  onSection,
  menuOpen,
  onMenu,
  clerkEnabled,
  isSignedIn,
  products,
  onOpenProduct,
  onOpenP2P,
  offers = [],
  onNeedClerk,
  isAdmin,
  onAdmin,
}: NavbarProps) {
  return (
    <header className="enter-nav sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-2 px-3 sm:gap-4 sm:px-4 lg:px-6">
        <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] text-ink lg:hidden" onClick={() => onMenu(!menuOpen)} aria-label="Menyu">
          {menuOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
        </button>
        <button type="button" className="flex min-w-0 items-center gap-2" onClick={() => onSection("bozor")} aria-label={BRAND_NAME}>
          <Logo />
          <span className="truncate text-base font-semibold tracking-tight text-ink sm:text-xl">{BRAND_NAME}</span>
        </button>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy">
          {[...ITEMS, ...(isSignedIn ? ACCOUNT_ITEMS : [])].map((item) => {
            const active = section === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onSection(item.id)}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-[6px] px-3 text-sm font-medium transition-colors duration-150",
                  active ? "bg-soft text-accent" : "text-muted hover:bg-subtle hover:text-ink",
                )}
              >
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <ProductSearch products={products} offers={offers} onOpenProduct={onOpenProduct} onOpenP2P={onOpenP2P} className="hidden min-w-[220px] md:block" />
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {isAdmin && (
            <button type="button" onClick={onAdmin} className="hidden min-h-10 rounded-[6px] px-3 text-sm font-medium text-accent hover:bg-soft lg:inline-flex">
              Admin panel
            </button>
          )}
          <div className="hidden h-8 w-px bg-line sm:block" />
          {isSignedIn && clerkEnabled ? (
            <UserButton />
          ) : (
            <KirishButton
              clerkEnabled={clerkEnabled}
              onNeedClerk={onNeedClerk}
              className="inline-flex min-h-11 items-center rounded-[6px] bg-accent px-3 text-sm font-semibold text-on-accent hover:bg-accent-hover sm:px-4"
            />
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-line bg-surface px-3 py-3 lg:hidden">
          <ProductSearch
            products={products}
            offers={offers}
            onOpenProduct={(id) => { onOpenProduct(id); onMenu(false); }}
            onOpenP2P={() => { onOpenP2P?.(); onMenu(false); }}
            className="mb-3 max-w-none md:hidden"
          />
          <div className="grid gap-1">
            {[
              ...ITEMS,
              ...(isSignedIn ? [...ACCOUNT_ITEMS, { id: "profil" as const, label: "Profil", icon: UserRound }] : []),
            ].map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onSection(item.id); onMenu(false); }}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-3 rounded-[6px] px-3 text-sm font-medium",
                    active ? "bg-soft text-accent" : "text-muted",
                  )}
                >
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
            {!isSignedIn && (
              <KirishButton
                clerkEnabled={clerkEnabled}
                onNeedClerk={onNeedClerk}
                onAfterClick={() => onMenu(false)}
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-[6px] bg-accent px-3 text-sm font-semibold text-on-accent"
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
}
