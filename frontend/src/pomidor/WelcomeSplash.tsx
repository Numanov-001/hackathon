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
    <div className="splash fixed inset-0 z-[80] grid place-items-center bg-canvas" role="status" aria-live="polite">
      <div className="grid justify-items-center gap-3">
        <Logo />
        <p className="text-2xl font-semibold tracking-tight text-ink">Pomidor</p>
        <p className="text-sm text-muted">Bozor ko‘rinishi</p>
        <span className="splash-bar mt-2 h-1 w-28 rounded-full bg-accent" />
      </div>
    </div>
  );
}
