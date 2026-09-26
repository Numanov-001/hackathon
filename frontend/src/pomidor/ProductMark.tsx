import { useEffect, useState } from "react";
import { cn } from "./lib/cn";

type ProductMarkProps = {
  name: string;
  image: string;
  size?: "sm" | "md";
};

export default function ProductMark({ name, image, size = "sm" }: ProductMarkProps) {
  const [ok, setOk] = useState(Boolean(image));
  const box = size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-[13px]";

  useEffect(() => {
    setOk(Boolean(image));
  }, [image]);

  if (!ok) {
    return (
      <span className={cn("grid shrink-0 place-items-center rounded-full bg-soft font-semibold text-accent", box)} aria-hidden="true">
        {name.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={image}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setOk(false)}
      className={cn("shrink-0 rounded-full object-cover ring-1 ring-line", box)}
    />
  );
}
