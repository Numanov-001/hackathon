const TEXT_MAX = 80;
const EMAIL_MAX = 120;
const SAFE_IMAGE = /^data:image\/(jpeg|jpg|png|webp);base64,[a-z0-9+/=\s]+$/i;

export function cleanText(value: string, max = TEXT_MAX) {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanEmail(value: string) {
  return cleanText(value, EMAIL_MAX).replace(/[^\w.@+-]/g, "");
}

export function isSafeImageUrl(value: string) {
  if (SAFE_IMAGE.test(value) && value.length < 1_200_000) return true;
  if (value.startsWith("/") && !value.includes("..") && !value.toLowerCase().includes("svg")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !value.toLowerCase().includes("svg");
  } catch {
    return false;
  }
}

const MAGIC: Array<{ type: string; test: (bytes: Uint8Array) => boolean }> = [
  { type: "image/jpeg", test: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 },
  { type: "image/png", test: (bytes) => bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 },
  { type: "image/webp", test: (bytes) => bytes[0] === 0x52 && bytes[8] === 0x57 },
];

export function isAllowedImageFile(file: File) {
  if (file.size > 900_000) return false;
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) return false;
  return file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
}

export async function fileToSafeDataUrl(file: File) {
  if (!isAllowedImageFile(file)) return null;
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 16));
  if (!MAGIC.some((item) => item.type === file.type && item.test(bytes))) return null;
  const reader = new FileReader();
  return new Promise<string | null>((resolve) => {
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(isSafeImageUrl(result) ? result : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
