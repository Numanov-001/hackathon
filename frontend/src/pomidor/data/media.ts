import { isSafeImageUrl } from "../lib/safe";

const KEY = "pomidor-product-images";

export type ImageMap = Record<string, string>;

function sanitizeMap(map: ImageMap) {
  return Object.fromEntries(
    Object.entries(map).filter(([id, url]) => /^[a-z0-9-]+$/i.test(id) && isSafeImageUrl(url)),
  );
}

export function loadImages(): ImageMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? sanitizeMap(JSON.parse(raw) as ImageMap) : {};
  } catch {
    return {};
  }
}

export function saveImages(map: ImageMap) {
  localStorage.setItem(KEY, JSON.stringify(sanitizeMap(map)));
}

function usableOverride(value: string) {
  return value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("/") || value.startsWith("https://");
}

export function applyImages<T extends { id: string; image: string }>(list: T[], map: ImageMap = loadImages()): T[] {
  const safe = sanitizeMap(map);
  return list.map((item) => {
    const override = safe[item.id];
    return override && usableOverride(override) ? { ...item, image: override } : item;
  });
}
