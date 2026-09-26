import { useCallback, useEffect, useState } from "react";
import { getJson, postJson } from "../../api/client";
import { buildOffers, type P2POffer } from "../data/p2p";
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

export function useDeskOffers(products: Product[]) {
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await getJson("/api/desk/offers");
      if (Array.isArray(rows) && rows.length) {
        setOffers(rows as P2POffer[]);
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
  }, [load]);

  async function publish(draft: DeskOfferDraft) {
    const row = (await postJson("/api/desk/offers", {
      ...draft,
      price: Number(draft.price),
      quantity: Number(draft.quantity),
    })) as P2POffer;
    setOffers((current) => {
      const base = current.length ? current : buildOffers(products);
      return [row, ...base.filter((item) => item.id !== row.id)];
    });
    setLive(true);
    return row;
  }

  const visible = live && offers.length ? offers : products.length ? buildOffers(products) : [];
  return { offers: visible, live, publish };
}
