import { ArrowLeftRight, CreditCard, Menu, Package, Store, UserRound, X } from "lucide-react";
import Logo from "./Logo";
import Notifications from "./Notifications";
import ProfileMenu from "./ProfileMenu";
import { cn } from "./lib/cn";
import type { NavId, Product, UserProfile } from "./types";

const ITEMS: Array<{ id: NavId; label: string; icon: typeof Store }> = [
  { id: "bozor", label: "Bozor", icon: Store },
  { id: "p2p", label: "P2P", icon: ArrowLeftRight },
  { id: "mahsulotlar", label: "Mahsulotlar", icon: Package },
  { id: "obuna", label: "Obuna", icon: CreditCard },
];

type NavbarProps = {
  section: NavId;
  onSection: (id: NavId) => void;
  menuOpen: boolean;
  onMenu: (open: boolean) => void;
  profile: UserProfile;
  products: Product[];
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
  onOpenProduct: (id: string) => void;
};

export default function Navbar({
  section,
  onSection,
  menuOpen,
  onMenu,
  profile,
  products,
  onProfile,
  onSettings,
  onLogout,
  onOpenProduct,
}: NavbarProps) {
  return (
    <header className="enter-nav sticky top-0 z-40 h-16 border-b border-[#E4E7EC] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-[1920px] items-center gap-6 px-4 lg:px-10">
        <button type="button" className="grid h-10 w-10 place-items-center rounded-xl text-[#14213D] lg:hidden" onClick={() => onMenu(!menuOpen)} aria-label="Menyu">
          {menuOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
        </button>
        <button type="button" className="flex items-center gap-2" onClick={() => onSection("bozor")}>
          <Logo />
          <span className="text-2xl font-bold tracking-tight text-[#14213D]">Pomidor</span>
        </button>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy">
          {ITEMS.map((item) => {
            const active = section === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onSection(item.id)}
                className={cn(
                  "inline-flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ease-linear",
                  active ? "bg-[#EAF8F0] text-[#087A45]" : "text-[#667085] hover:bg-[#F5FBF7]",
                )}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Notifications products={products} enabled={profile.alerts} onOpenProduct={onOpenProduct} />
          <div className="hidden h-8 w-px bg-[#E4E7EC] sm:block" />
          <ProfileMenu profile={profile} onProfile={onProfile} onSettings={onSettings} onLogout={onLogout} />
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-[#E4E7EC] bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {[...ITEMS, { id: "profil" as const, label: "Profil", icon: UserRound }].map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onSection(item.id); onMenu(false); }}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    active ? "bg-[#EAF8F0] text-[#087A45]" : "text-[#667085]",
                  )}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
