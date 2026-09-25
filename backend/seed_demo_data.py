"""Seed demo products, regions, users, and P2P ASK/BID intentions."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, init_db
from app.models import Offer, OfferStatus, OrderType, Product, Region, User, UserRole

PRODUCTS = [
    {"name": "Tomato", "category": "Meva va sabzavotlar", "unit": "kg"},
    {"name": "Potato", "category": "Meva va sabzavotlar", "unit": "kg"},
    {"name": "Onion", "category": "Meva va sabzavotlar", "unit": "kg"},
    {"name": "Cucumber", "category": "Meva va sabzavotlar", "unit": "kg"},
    {"name": "Apple", "category": "Meva va sabzavotlar", "unit": "kg"},
]

REGIONS = ["Namangan", "Tashkent", "Andijan", "Fergana", "Samarkand"]

USERS = [
    {"name": "Akmal Seller", "phone": "+998901000001", "role": UserRole.SELLER},
    {"name": "Dilnoza Seller", "phone": "+998901000002", "role": UserRole.SELLER},
    {"name": "Jasur Buyer", "phone": "+998901000003", "role": UserRole.BUYER},
    {"name": "Madina Buyer", "phone": "+998901000004", "role": UserRole.BUYER},
]

# BID prices stay below ASK on purpose. Chart median must ignore BID later.
OFFERS = [
    # Tomato
    {"product": "Tomato", "region": "Namangan", "user": "+998901000001", "price": "5000", "volume": "1000", "type": OrderType.ASK, "days_ago": 0},
    {"product": "Tomato", "region": "Namangan", "user": "+998901000002", "price": "5100", "volume": "800", "type": OrderType.ASK, "days_ago": 0},
    {"product": "Tomato", "region": "Namangan", "user": "+998901000003", "price": "4500", "volume": "500", "type": OrderType.BID, "days_ago": 0},
    {"product": "Tomato", "region": "Andijan", "user": "+998901000002", "price": "4800", "volume": "300", "type": OrderType.ASK, "days_ago": 1},
    {"product": "Tomato", "region": "Tashkent", "user": "+998901000001", "price": "5600", "volume": "600", "type": OrderType.ASK, "days_ago": 1},
    {"product": "Tomato", "region": "Fergana", "user": "+998901000002", "price": "4950", "volume": "700", "type": OrderType.ASK, "days_ago": 2},
    {"product": "Tomato", "region": "Samarkand", "user": "+998901000004", "price": "4300", "volume": "400", "type": OrderType.BID, "days_ago": 1},
    # Potato
    {"product": "Potato", "region": "Namangan", "user": "+998901000001", "price": "2800", "volume": "2000", "type": OrderType.ASK, "days_ago": 0},
    {"product": "Potato", "region": "Tashkent", "user": "+998901000002", "price": "3100", "volume": "1500", "type": OrderType.ASK, "days_ago": 0},
    {"product": "Potato", "region": "Andijan", "user": "+998901000001", "price": "2700", "volume": "1800", "type": OrderType.ASK, "days_ago": 1},
    {"product": "Potato", "region": "Fergana", "user": "+998901000003", "price": "2400", "volume": "800", "type": OrderType.BID, "days_ago": 0},
    # Onion
    {"product": "Onion", "region": "Samarkand", "user": "+998901000002", "price": "2600", "volume": "1200", "type": OrderType.ASK, "days_ago": 0},
    {"product": "Onion", "region": "Namangan", "user": "+998901000001", "price": "2400", "volume": "900", "type": OrderType.ASK, "days_ago": 1},
    {"product": "Onion", "region": "Tashkent", "user": "+998901000002", "price": "2900", "volume": "700", "type": OrderType.ASK, "days_ago": 2},
    {"product": "Onion", "region": "Andijan", "user": "+998901000004", "price": "2100", "volume": "500", "type": OrderType.BID, "days_ago": 0},
    # Cucumber
    {"product": "Cucumber", "region": "Namangan", "user": "+998901000001", "price": "4700", "volume": "400", "type": OrderType.ASK, "days_ago": 0},
    {"product": "Cucumber", "region": "Fergana", "user": "+998901000002", "price": "4500", "volume": "550", "type": OrderType.ASK, "days_ago": 1},
    {"product": "Cucumber", "region": "Tashkent", "user": "+998901000001", "price": "5200", "volume": "350", "type": OrderType.ASK, "days_ago": 0},
    {"product": "Cucumber", "region": "Samarkand", "user": "+998901000003", "price": "4000", "volume": "250", "type": OrderType.BID, "days_ago": 1},
    # Apple
    {"product": "Apple", "region": "Samarkand", "user": "+998901000002", "price": "9500", "volume": "800", "type": OrderType.ASK, "days_ago": 0},
    {"product": "Apple", "region": "Tashkent", "user": "+998901000001", "price": "11000", "volume": "500", "type": OrderType.ASK, "days_ago": 1},
    {"product": "Apple", "region": "Namangan", "user": "+998901000002", "price": "9000", "volume": "600", "type": OrderType.ASK, "days_ago": 2},
    {"product": "Apple", "region": "Andijan", "user": "+998901000004", "price": "8200", "volume": "300", "type": OrderType.BID, "days_ago": 0},
]


def _get_or_create(db: Session, model, filters: dict, values: dict):
    row = db.execute(select(model).filter_by(**filters)).scalar_one_or_none()
    if row is None:
        row = model(**values)
        db.add(row)
        db.flush()
    return row


def seed(db: Session) -> dict[str, int]:
    products = {
        item["name"]: _get_or_create(
            db,
            Product,
            {"name": item["name"]},
            item,
        )
        for item in PRODUCTS
    }
    regions = {
        name: _get_or_create(db, Region, {"name": name}, {"name": name})
        for name in REGIONS
    }
    users = {
        item["phone"]: _get_or_create(
            db,
            User,
            {"phone": item["phone"]},
            item,
        )
        for item in USERS
    }

    existing_offers = db.execute(select(Offer.id)).first()
    if existing_offers is not None:
        return {
            "products": len(products),
            "regions": len(regions),
            "users": len(users),
            "offers_added": 0,
        }

    now = datetime.now(timezone.utc)
    for item in OFFERS:
        created_at = now - timedelta(days=item["days_ago"])
        db.add(
            Offer(
                product_id=products[item["product"]].id,
                region_id=regions[item["region"]].id,
                seller_id=users[item["user"]].id,
                price=Decimal(item["price"]),
                volume=Decimal(item["volume"]),
                order_type=item["type"],
                status=OfferStatus.ACTIVE,
                created_at=created_at,
                expires_at=created_at + timedelta(days=7),
            )
        )

    return {
        "products": len(products),
        "regions": len(regions),
        "users": len(users),
        "offers_added": len(OFFERS),
    }


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        stats = seed(db)
        db.commit()
    finally:
        db.close()

    print(
        "seed complete: "
        f"{stats['products']} products, {stats['regions']} regions, "
        f"{stats['users']} users, {stats['offers_added']} offers added"
    )


if __name__ == "__main__":
    main()
