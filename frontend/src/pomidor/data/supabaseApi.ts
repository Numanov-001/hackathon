import type { P2POffer } from "./p2p";
import { PAYMENTS } from "./p2p";
import type { UserProfile } from "../types";
import { supabase } from "../lib/supabase";

const PROFILE_ID = "pomidor-profile-id";

export function clientId() {
  let id = localStorage.getItem(PROFILE_ID);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PROFILE_ID, id);
  }
  return id;
}

export async function fetchRemoteImages() {
  if (!supabase) return {};
  const { data, error } = await supabase.from("product_images").select("product_id, image_url");
  if (error || !data) return {};
  return Object.fromEntries(data.map((row) => [row.product_id, row.image_url]));
}

export async function upsertProductImage(productId: string, imageUrl: string) {
  if (!supabase) return false;
  const { error } = await supabase.from("product_images").upsert({
    product_id: productId,
    image_url: imageUrl,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export async function deleteProductImage(productId: string) {
  if (!supabase) return false;
  const { error } = await supabase.from("product_images").delete().eq("product_id", productId);
  return !error;
}

export async function uploadProductImage(productId: string, file: File) {
  if (!supabase) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${productId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) return null;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  const ok = await upsertProductImage(productId, data.publicUrl);
  return ok ? data.publicUrl : null;
}

export async function fetchOffers(): Promise<P2POffer[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("p2p_offers").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    side: row.side,
    productId: row.product_id,
    productName: row.product_name,
    unit: row.unit === "m" || row.unit === "qop" ? row.unit : "kg",
    seller: row.seller,
    phone: typeof row.phone === "string" ? row.phone : "",
    verified: row.verified,
    rating: Number(row.rating),
    trades: Number(row.trades),
    price: Number(row.price),
    available: Number(row.available),
    minQty: Number(row.min_kg ?? row.min_qty ?? 0),
    maxQty: Number(row.max_kg ?? row.max_qty ?? 0),
    payment: (PAYMENTS as readonly string[]).includes(row.payment) ? row.payment as P2POffer["payment"] : "Naqd",
    region: row.region,
    postedAt: String(row.created_at ?? new Date().toISOString()),
  }));
}

export async function fetchProfile(): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", clientId()).maybeSingle();
  if (error || !data) return null;
  return {
    name: data.name,
    email: data.email,
    picture: data.picture || "",
    phone: data.phone,
    region: data.region,
    alerts: Boolean(data.alerts),
    plan: "free",
  };
}

export async function upsertProfile(profile: UserProfile) {
  if (!supabase) return false;
  const { error } = await supabase.from("profiles").upsert({
    id: clientId(),
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    picture: profile.picture,
    region: profile.region,
    alerts: profile.alerts,
    plan: profile.plan,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export async function recordTrade(offer: P2POffer) {
  if (!supabase) return false;
  const { error } = await supabase.from("p2p_trades").insert({
    offer_id: offer.id,
    seller: offer.seller,
    product_name: offer.productName,
    price: offer.price,
  });
  return !error;
}
