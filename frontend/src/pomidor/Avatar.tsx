import { cn } from "./lib/cn";

type AvatarProps = {
  name: string;
  picture?: string;
  size?: "sm" | "md";
};

export default function Avatar({ name, picture, size = "sm" }: AvatarProps) {
  const box = size === "md" ? "h-11 w-11 text-sm" : "h-9 w-9 text-[13px]";
  if (picture) {
    return <img src={picture} alt="" className={cn("rounded-full object-cover ring-1 ring-line", box)} />;
  }
  return (
    <span className={cn("grid place-items-center rounded-full bg-soft font-semibold text-accent", box)} aria-hidden="true">
      {(name || "P").slice(0, 1).toUpperCase()}
    </span>
  );
}
