const KEY = "pomidor-product-images";

export type ImageMap = Record<string, string>;

export function loadImages(): ImageMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as ImageMap : {};
  } catch {
    return {};
  }
}

export function saveImages(map: ImageMap) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

function usableOverride(value: string) {
  return value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("/");
}

export function applyImages<T extends { id: string; image: string }>(list: T[], map: ImageMap = loadImages()): T[] {
  return list.map((item) => {
    const override = map[item.id];
    return override && usableOverride(override) ? { ...item, image: override } : item;
  });
}
