import type { P2POffer } from "../data/p2p";

export type MatchRow = {
  id: string;
  productName: string;
  productId: string;
  seller: P2POffer;
  buyer: P2POffer;
  score: number;
};

function qtyScore(seller: P2POffer, buyer: P2POffer) {
  const need = buyer.available;
  const have = seller.available;
  if (!need || !have) return 0;
  return Math.min(need, have) / Math.max(need, have);
}

function priceScore(seller: P2POffer, buyer: P2POffer) {
  if (seller.price <= buyer.price) return 1;
  const over = (seller.price - buyer.price) / buyer.price;
  return Math.max(0, 1 - over * 2);
}

function placeScore(seller: P2POffer, buyer: P2POffer) {
  if (seller.region === buyer.region) return 1;
  return 0.72;
}

export function matchOffers(offers: P2POffer[]): MatchRow[] {
  const sells = offers.filter((item) => item.side === "sell");
  const buys = offers.filter((item) => item.side === "buy");
  const rows: MatchRow[] = [];
  for (const seller of sells) {
    for (const buyer of buys) {
      if (seller.productId !== buyer.productId) continue;
      const score = Math.round((qtyScore(seller, buyer) * 0.3 + priceScore(seller, buyer) * 0.45 + placeScore(seller, buyer) * 0.25) * 100);
      if (score < 50) continue;
      rows.push({
        id: `${seller.id}-${buyer.id}`,
        productName: seller.productName,
        productId: seller.productId,
        seller,
        buyer,
        score,
      });
    }
  }
  return rows.sort((a, b) => b.score - a.score).slice(0, 6);
}

export type RegionSpread = {
  productId: string;
  productName: string;
  lowRegion: string;
  lowPrice: number;
  highRegion: string;
  highPrice: number;
  difference: number;
};

export function regionalSpreads(offers: P2POffer[]): RegionSpread[] {
  const byProduct = new Map<string, P2POffer[]>();
  for (const offer of offers) {
    if (offer.side !== "sell" || offer.price <= 0) continue;
    const list = byProduct.get(offer.productId) ?? [];
    list.push(offer);
    byProduct.set(offer.productId, list);
  }
  const rows: RegionSpread[] = [];
  for (const [productId, list] of byProduct) {
    const byRegion = new Map<string, number[]>();
    for (const item of list) {
      const prices = byRegion.get(item.region) ?? [];
      prices.push(item.price);
      byRegion.set(item.region, prices);
    }
    if (byRegion.size < 2) continue;
    const averages = [...byRegion.entries()].map(([region, prices]) => ({
      region,
      price: prices.reduce((a, b) => a + b, 0) / prices.length,
    }));
    const low = averages.reduce((best, item) => (item.price < best.price ? item : best));
    const high = averages.reduce((best, item) => (item.price > best.price ? item : best));
    if (!low.price || low.region === high.region) continue;
    rows.push({
      productId,
      productName: list[0].productName,
      lowRegion: low.region,
      lowPrice: low.price,
      highRegion: high.region,
      highPrice: high.price,
      difference: ((high.price - low.price) / low.price) * 100,
    });
  }
  return rows.slice(0, 4);
}
