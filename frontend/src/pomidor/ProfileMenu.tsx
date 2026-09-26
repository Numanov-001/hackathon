import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, CreditCard, LogOut, UserRound } from "lucide-react";
import Avatar from "./Avatar";
import { cn } from "./lib/cn";
import { PLANS } from "./data/profile";
import type { UserProfile } from "./types";

type ProfileMenuProps = {
  profile: UserProfile;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
};

export default function ProfileMenu({ profile, onProfile, onSettings, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function go(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div className="relative" ref={root}>
      <div className={cn("flex items-center rounded-[6px] py-1 pl-1 pr-1", open ? "bg-soft" : "hover:bg-subtle")}>
        <button type="button" onClick={onProfile} className="flex items-center gap-2 rounded-[6px] py-0.5 pl-0.5 pr-2">
          <Avatar name={profile.name} picture={profile.picture} />
          <span className="hidden text-left sm:grid">
            <span className="text-sm font-semibold text-ink">{profile.name.split(" ")[0] || "Hisob"}</span>
            <span className="max-w-[160px] truncate text-[13px] text-muted">{profile.email}</span>
          </span>
        </button>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label="Profil menyusi"
          onClick={() => setOpen((value) => !value)}
          className="grid h-9 w-9 place-items-center rounded-[6px] text-muted"
        >
          <ChevronDown size={16} strokeWidth={1.8} className={cn("transition-transform duration-200", open && "rotate-180")} />
        </button>
      </div>
      <div
        id={menuId}
        role="menu"
        aria-hidden={!open}
        className={cn(
          "absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right rounded-[10px] border border-line bg-surface p-2 shadow-overlay transition-all duration-200",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 rounded-[6px] px-2 py-2">
          <Avatar name={profile.name} picture={profile.picture} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{profile.name}</p>
            <p className="truncate text-[13px] text-muted">{PLANS.find((item) => item.id === profile.plan)?.name ?? "Bepul"}</p>
          </div>
        </div>
        <div className="my-1 h-px bg-line" />
        <button type="button" role="menuitem" onClick={() => go(onProfile)} className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-subtle">
          <UserRound size={16} strokeWidth={1.8} className="text-muted" />
          Profil
        </button>
        <button type="button" role="menuitem" onClick={() => go(onSettings)} className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-medium text-ink hover:bg-subtle">
          <CreditCard size={16} strokeWidth={1.8} className="text-muted" />
          Obuna
        </button>
        <button type="button" role="menuitem" onClick={() => go(onLogout)} className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-medium text-bid hover:bg-subtle">
          <LogOut size={16} strokeWidth={1.8} />
          Chiqish
        </button>
      </div>
    </div>
  );
}
