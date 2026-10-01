import { useCallback, useEffect, useRef, useState } from "react";
import { getJson, postJson } from "../../api/client";
import type { P2POffer } from "../data/p2p";
import type { Product } from "../types";

export type DeskOfferDraft = {
  side: P2POffer["side"];
  productId: string;
  price: string;
  quantity: string;
  region: string;
  payment: string;
  name: string;
  phone: string;
};

const PHONE = /^\+998\d{9}$/;

function asOffer(row: unknown): P2POffer | null {
  if (!row || typeof row !== "object") return null;
  const item = row as P2POffer;
  if (!item.id || !item.seller) return null;
  const phone = typeof item.phone === "string" && PHONE.test(item.phone) ? item.phone : "";
  return { ...item, phone };
}

export function useDeskOffers(
  products: Product[],
  getToken: (() => Promise<string | null>) | undefined,
  plan: string,
) {
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [live, setLive] = useState(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const load = useCallback(async () => {
    try {
      const token = getTokenRef.current ? await getTokenRef.current() : null;
      const rows = await getJson("/api/desk/offers", token);
      if (Array.isArray(rows) && rows.length) {
        setOffers(rows.map(asOffer).filter((item): item is P2POffer => item !== null));
        setLive(true);
        return;
      }
      setLive(false);
    } catch {
      setLive(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, plan]);

  async function publish(draft: DeskOfferDraft) {
    const token = getTokenRef.current ? await getTokenRef.current() : null;
    await postJson(
      "/api/desk/offers",
      {
        ...draft,
        price: Number(draft.price),
        quantity: Number(draft.quantity),
      },
      token,
    );
    await load();
  }

  return { offers, live, publish };
}
