import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, CreditCard, LogOut, UserRound } from "lucide-react";
import { cn } from "./lib/cn";
import { PLANS } from "./data/profile";
import type { UserProfile } from "./types";

const AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80";

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
      <div
        className={cn(
          "flex items-center rounded-xl py-1 pl-1 pr-1 transition-all duration-150 ease-out",
          open ? "bg-[#EAF8F0]" : "hover:bg-[#F5FBF7]",
        )}
      >
        <button type="button" onClick={onProfile} className="flex items-center gap-2 rounded-lg py-0.5 pl-0.5 pr-2">
          <img src={AVATAR} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-[#E4E7EC]" />
          <span className="hidden text-left sm:grid">
            <span className="text-sm font-semibold text-[#14213D]">{profile.name.split(" ")[0]}</span>
            <span className="text-xs text-[#667085]">{profile.role}</span>
          </span>
        </button>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label="Profil menyusi"
          onClick={() => setOpen((value) => !value)}
          className="grid h-9 w-9 place-items-center rounded-lg text-[#667085]"
        >
          <ChevronDown size={16} strokeWidth={1.8} className={cn("transition-transform duration-200 ease-out", open && "rotate-180")} />
        </button>
      </div>
      <div
        id={menuId}
        role="menu"
        aria-hidden={!open}
        className={cn(
          "absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-[0_16px_40px_rgba(16,24,40,0.12)] transition-all duration-200 ease-out",
          open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <img src={AVATAR} alt="" className="h-11 w-11 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-[#14213D]">{profile.name}</p>
            <p className="text-xs text-[#667085]">{profile.role} · {PLANS.find((item) => item.id === profile.plan)?.name ?? "Bepul"}</p>
          </div>
        </div>
        <div className="my-1 h-px bg-[#E4E7EC]" />
        <button type="button" role="menuitem" onClick={() => go(onProfile)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#14213D] transition-colors duration-150 hover:bg-[#F5FBF7]">
          <UserRound size={16} strokeWidth={1.8} className="text-[#667085]" />
          Profil
        </button>
        <button type="button" role="menuitem" onClick={() => go(onSettings)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#14213D] transition-colors duration-150 hover:bg-[#F5FBF7]">
          <CreditCard size={16} strokeWidth={1.8} className="text-[#667085]" />
          Obuna
        </button>
        <button type="button" role="menuitem" onClick={() => go(onLogout)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#F04438] transition-colors duration-150 hover:bg-[#FEF3F2]">
          <LogOut size={16} strokeWidth={1.8} />
          Chiqish
        </button>
      </div>
    </div>
  );
}
