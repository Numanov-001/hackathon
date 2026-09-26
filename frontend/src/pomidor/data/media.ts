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

export function applyImages<T extends { id: string; image: string }>(list: T[], map: ImageMap = loadImages()): T[] {
  return list.map((item) => (map[item.id] ? { ...item, image: map[item.id] } : item));
}
