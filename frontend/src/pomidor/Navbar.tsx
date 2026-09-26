import { SignInButton, UserButton } from "@clerk/react";
import { clerkAppearance } from "./clerkAppearance";
import { ArrowLeftRight, CreditCard, Menu, Package, Store, UserRound, X } from "lucide-react";
import Logo from "./Logo";
import Notifications from "./Notifications";
import ProductSearch from "./ProductSearch";
import { cn } from "./lib/cn";
import type { NavId, Product } from "./types";

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
  alerts: boolean;
  products: Product[];
  onOpenProduct: (id: string) => void;
  onNeedClerk: () => void;
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
  alerts,
  products,
  onOpenProduct,
  onNeedClerk,
}: NavbarProps) {
  return (
    <header className="enter-nav sticky top-0 z-40 h-16 border-b border-line bg-surface">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-4 px-4 lg:px-6">
        <button type="button" className="grid h-10 w-10 place-items-center rounded-[6px] text-ink lg:hidden" onClick={() => onMenu(!menuOpen)} aria-label="Menyu">
          {menuOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
        </button>
        <button type="button" className="flex items-center gap-2" onClick={() => onSection("bozor")}>
          <Logo />
          <span className="text-xl font-semibold tracking-tight text-ink">Pomidor</span>
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
        <ProductSearch products={products} onOpenProduct={onOpenProduct} />
        <div className="ml-auto flex items-center gap-3">
          {isSignedIn && <Notifications products={products} enabled={alerts} onOpenProduct={onOpenProduct} />}
          <div className="hidden h-8 w-px bg-line sm:block" />
          {isSignedIn && clerkEnabled ? (
            <UserButton />
          ) : (
            <KirishButton
              clerkEnabled={clerkEnabled}
              onNeedClerk={onNeedClerk}
              className="inline-flex min-h-10 items-center rounded-[6px] bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            />
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-line bg-surface px-4 py-3 lg:hidden">
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
