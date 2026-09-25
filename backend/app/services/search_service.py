from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Product, Region
from app.schemas.chat import SearchIntent
from app.services.recommendation_service import recommend_asks
from app.utils.fuzzy_search import fuzzy_match_product, normalize_product_name


def _match_region(db: Session, name: str | None) -> Region | None:
    if not name:
        return None
    return db.execute(select(Region).where(Region.name.ilike(name))).scalar_one_or_none()


def search_offers(
    db: Session,
    query: str,
    region_name: str | None = None,
    volume: Decimal | None = None,
    max_price: Decimal | None = None,
) -> dict:
    names = list(db.execute(select(Product.name)).scalars())
    exact = next((n for n in names if n.lower() == query.strip().lower()), None)
    product_name = exact or normalize_product_name(query)
    product = db.execute(select(Product).where(Product.name.ilike(product_name))).scalar_one_or_none()
    tier = 1

    if product is None:
        fuzzy = fuzzy_match_product(query, names)
        if fuzzy:
            product = db.execute(select(Product).where(Product.name == fuzzy)).scalar_one()
            tier = 2

    if product is None:
        return {
            "tier": 3,
            "product": None,
            "query": query,
            "offers": [],
            "note": "No product match. Use /api/chat for natural-language fallback.",
        }

    region = _match_region(db, region_name)
    offers = recommend_asks(db, product.id, region.id if region else None, volume)
    if max_price is not None:
        offers = [item for item in offers if Decimal(str(item["price"])) <= max_price]
    if not exact:
        tier = max(tier, 2)

    return {
        "tier": tier,
        "product": product.name,
        "query": query,
        "offers": offers,
        "note": "Tier 1 = exact DB match, tier 2 = fuzzy + deterministic ranking.",
    }


def search_from_intent(db: Session, intent: SearchIntent) -> dict:
    query = intent.product or intent.raw_query
    return search_offers(
        db,
        query=query,
        region_name=intent.region,
        volume=intent.volume,
        max_price=intent.max_price,
    )
