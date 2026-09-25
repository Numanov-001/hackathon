from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Offer, OfferStatus, OrderType
from app.services.offer_service import list_offers, to_offer_read


def _price_score(price: Decimal, prices: list[Decimal]) -> float:
    min_p = min(prices)
    max_p = max(prices)
    if max_p == min_p:
        return 1.0
    return float((max_p - price) / (max_p - min_p))


def _volume_score(offer_volume: Decimal, needed: Decimal | None) -> float:
    if needed is None or needed <= 0:
        return 1.0
    if offer_volume >= needed:
        return 1.0
    return float(offer_volume / needed)


def recommend_asks(
    db: Session,
    product_id: int,
    region_id: int | None = None,
    volume: Decimal | None = None,
    limit: int = 10,
) -> list[dict]:
    settings = get_settings()
    offers = list_offers(
        db,
        product_id=product_id,
        order_type=OrderType.ASK,
        status=OfferStatus.ACTIVE,
    )
    if not offers:
        return []

    prices = [o.price for o in offers]
    scored: list[tuple[float, Offer]] = []
    for offer in offers:
        location = 1.0 if region_id is None or offer.region_id == region_id else 0.0
        score = (
            _price_score(offer.price, prices) * settings.rec_price_weight
            + location * settings.rec_location_weight
            + _volume_score(offer.volume, volume) * settings.rec_volume_weight
        )
        scored.append((score, offer))

    scored.sort(key=lambda item: (-item[0], item[1].created_at.timestamp() * -1))
    results = []
    for score, offer in scored[:limit]:
        payload = to_offer_read(offer).model_dump(mode="json")
        payload["relevance_score"] = round(score, 4)
        results.append(payload)
    return results
