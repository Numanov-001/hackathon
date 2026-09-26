import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function WelcomeSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(false);
      return;
    }
    const timer = window.setTimeout(() => setShow(false), 1340);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash fixed inset-0 z-[80] grid place-items-center bg-[#F7FAF8]/90 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="grid justify-items-center gap-3">
        <Logo />
        <p className="text-2xl font-bold tracking-tight text-[#14213D]">Pomidor</p>
        <p className="text-sm text-[#667085]">Bozor va P2P analitika</p>
        <span className="splash-bar mt-2 h-1 w-28 rounded-full bg-[#16A05D]" />
      </div>
    </div>
  );
}
