from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal
from statistics import median

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Offer, OfferStatus, OrderType, Product, Region
from app.schemas.market import MarketHistory, MarketSummary, MedianPoint, RegionHistory
from app.services.historical_index import synthetic_monthly_prices

HISTORY_DISCLAIMER = (
    "Older points are a synthetic historical estimate "
    "(base price × cumulative fruit/vegetable index), not official collected prices. "
    "Recent daily points are median ASK from user P2P intentions only. BID is excluded."
)


def _as_date(value: datetime | date) -> date:
    if isinstance(value, datetime):
        return value.date()
    return value


def resolve_product(db: Session, product_ref: str) -> Product:
    if product_ref.isdigit():
        product = db.get(Product, int(product_ref))
    else:
        # Try slug first, then name (ilike)
        product = db.execute(
            select(Product).where(Product.slug == product_ref)
        ).scalar_one_or_none()
        if product is None:
            product = db.execute(
                select(Product).where(Product.name.ilike(product_ref))
            ).scalar_one_or_none()
    if product is None:
        raise ValueError("Product not found")
    return product


def resolve_region(db: Session, region_ref: str | None) -> Region | None:
    if not region_ref:
        return None
    if region_ref.isdigit():
        region = db.get(Region, int(region_ref))
    else:
        region = db.execute(
            select(Region).where(Region.name.ilike(region_ref))
        ).scalar_one_or_none()
    if region is None:
        raise ValueError("Region not found")
    return region


def _ask_offers(db: Session, product_id: int, region_id: int | None = None) -> list[Offer]:
    stmt = select(Offer).options(joinedload(Offer.region)).where(
        Offer.product_id == product_id,
        Offer.order_type == OrderType.ASK,
        Offer.status == OfferStatus.ACTIVE,
    )
    if region_id is not None:
        stmt = stmt.where(Offer.region_id == region_id)
    return list(db.execute(stmt).unique().scalars())


def daily_median_by_region(offers: list[Offer]) -> dict[str, dict[str, Decimal]]:
    buckets: dict[str, dict[str, list[Decimal]]] = defaultdict(lambda: defaultdict(list))
    for offer in offers:
        if offer.order_type != OrderType.ASK:
            continue
        day = _as_date(offer.created_at).isoformat()
        buckets[offer.region.name][day].append(Decimal(offer.price))
    return {
        region: {day: Decimal(str(median(prices))) for day, prices in days.items()}
        for region, days in buckets.items()
    }


def top_active_regions(offers: list[Offer], limit: int = 3) -> list[str]:
    counts: dict[str, int] = defaultdict(int)
    for offer in offers:
        counts[offer.region.name] += 1
    ranked = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    return [name for name, _ in ranked[:limit]]


def market_history(
    db: Session,
    product_ref: str,
    region_ref: str | None = None,
    top_regions: int = 3,
) -> MarketHistory:
    product = resolve_product(db, product_ref)
    region = resolve_region(db, region_ref)
    offers = _ask_offers(db, product.id, region.id if region else None)
    medians = daily_median_by_region(offers)
    region_names = [region.name] if region else top_active_regions(offers, top_regions)
    if not region_names:
        region_names = [
            row.name for row in db.execute(select(Region).limit(top_regions)).scalars()
        ]

    regions_payload: list[RegionHistory] = []
    for name in region_names:
        synthetic = [
            MedianPoint(
                date=day,
                median_price=Decimal(str(price)),
                source="synthetic_historical",
            )
            for day, price in synthetic_monthly_prices(product.name, name)
        ]
        live_points = [
            MedianPoint(date=day, median_price=price, source="user_ask_median")
            for day, price in sorted(medians.get(name, {}).items())
        ]
        regions_payload.append(RegionHistory(region=name, data=synthetic + live_points))

    return MarketHistory(
        product=product.name,
        unit=f"UZS/{product.unit}",
        disclaimer=HISTORY_DISCLAIMER,
        regions=regions_payload,
    )


def market_summary(db: Session, product_ref: str, region_ref: str | None = None) -> MarketSummary:
    product = resolve_product(db, product_ref)
    region = resolve_region(db, region_ref)

    stmt = select(Offer).where(
        Offer.product_id == product.id,
        Offer.status == OfferStatus.ACTIVE,
    )
    if region is not None:
        stmt = stmt.where(Offer.region_id == region.id)
    offers = list(db.execute(stmt).scalars())

    asks = [o for o in offers if o.order_type == OrderType.ASK]
    bids = [o for o in offers if o.order_type == OrderType.BID]
    best_ask = min((o.price for o in asks), default=None)
    best_bid = max((o.price for o in bids), default=None)
    spread = (best_ask - best_bid) if best_ask is not None and best_bid is not None else None

    return MarketSummary(
        product=product.name,
        region=region.name if region else None,
        unit=f"UZS/{product.unit}",
        best_ask=best_ask,
        best_bid=best_bid,
        spread=spread,
        active_asks=len(asks),
        active_bids=len(bids),
        note=(
            "Best ask/bid and spread come from user P2P intentions, "
            "not an official real-time market price. Spread is a liquidity signal, "
            "not proof of shortage."
        ),
    )
