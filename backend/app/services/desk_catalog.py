"""Desk catalog: monthly bars and P2P intentions in the same FastAPI DB."""

from __future__ import annotations

import math
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Offer, OfferStatus, OrderType, PriceBar, Product, Region, User, UserRole

SPECS = [
    {"slug": "pomidor", "name": "Pomidor", "category": "sabzavot", "unit": "kg", "base": 9200, "seasonal": 2800, "phase": 0.0, "trend": 0.04, "volume": 18000},
    {"slug": "kartoshka", "name": "Kartoshka", "category": "sabzavot", "unit": "kg", "base": 5600, "seasonal": 900, "phase": -1.57, "trend": 0.03, "volume": 24000},
    {"slug": "piyoz", "name": "Piyoz", "category": "sabzavot", "unit": "kg", "base": 3100, "seasonal": 950, "phase": -1.2, "trend": 0.05, "volume": 16000},
    {"slug": "bodring", "name": "Bodring", "category": "sabzavot", "unit": "kg", "base": 7400, "seasonal": 2000, "phase": 0.15, "trend": 0.02, "volume": 12000},
    {"slug": "pe-truba", "name": "PE suv trubasi", "category": "truba", "unit": "m", "base": 18500, "seasonal": 1100, "phase": -1.05, "trend": 0.08, "volume": 4200},
    {"slug": "metall-truba", "name": "Metall truba", "category": "truba", "unit": "m", "base": 44800, "seasonal": 1600, "phase": -0.9, "trend": 0.11, "volume": 2800},
    {"slug": "pvc-truba", "name": "PVC kanalizatsiya", "category": "truba", "unit": "m", "base": 12600, "seasonal": 700, "phase": -1.0, "trend": 0.06, "volume": 3600},
    {"slug": "un", "name": "Bug‘doy uni", "category": "optom", "unit": "qop", "base": 412000, "seasonal": 22000, "phase": -1.45, "trend": 0.07, "volume": 4200},
    {"slug": "yog", "name": "Kungaboqar yog‘i", "category": "optom", "unit": "kg", "base": 16800, "seasonal": 900, "phase": 2.4, "trend": 0.09, "volume": 9000},
    {"slug": "guruch", "name": "Guruch", "category": "optom", "unit": "kg", "base": 14500, "seasonal": 1100, "phase": -1.35, "trend": 0.05, "volume": 14000},
]

REGIONS = [
    "Toshkent shahri",
    "Toshkent viloyati",
    "Andijon",
    "Buxoro",
    "Farg‘ona",
    "Jizzax",
    "Namangan",
    "Navoiy",
    "Qashqadaryo",
    "Qoraqalpog‘iston",
    "Samarqand",
    "Sirdaryo",
    "Surxondaryo",
    "Xorazm",
]

SELLERS = [
    ("Agro Fresh", "+998909100001", True, 99.1, 428),
    ("Samarqand Dehqon", "+998909100002", True, 98.4, 312),
    ("Toshkent Opt", "+998909100003", True, 98.9, 640),
    ("Farg‘ona Plus", "+998909100004", True, 99.4, 510),
]

PAYMENTS = ["Naqd", "Uzcard", "Humo", "Click", "Payme"]
CHART_START = date(2024, 10, 1)
CHART_MONTHS = 24


def _lot(unit: str, p_index: int, s_index: int) -> int:
    if unit == "m":
        lot = 200
        return lot + ((p_index * 30 + s_index * 18) % (lot * 3))
    if unit == "qop":
        lot = 40
        return lot + ((p_index * 8 + s_index * 6) % 80)
    tons = 2 + ((p_index * 3 + s_index * 2) % 14)
    return tons * 1000


def _complete_seed_book(db: Session, products: dict, regions: dict) -> None:
    """Each demo seller posts both a buy and a sell, with wholesale lot sizes."""
    sellers = []
    for _name, phone, *_rest in SELLERS:
        user = db.execute(select(User).where(User.phone == phone)).scalar_one_or_none()
        if user is not None:
            sellers.append(user)
    now = datetime(2026, 9, 26, tzinfo=timezone.utc)
    for p_index, spec in enumerate(SPECS):
        product = products.get(spec["slug"])
        if product is None:
            continue
        last = db.execute(
            select(PriceBar.price).where(PriceBar.product_id == product.id).order_by(PriceBar.date.desc())
        ).scalars().first()
        last_price = int(last or spec["base"])
        for s_index, seller in enumerate(sellers):
            rows = list(
                db.execute(
                    select(Offer).where(
                        Offer.product_id == product.id,
                        Offer.seller_id == seller.id,
                        Offer.status == OfferStatus.ACTIVE,
                    )
                ).scalars()
            )
            have = {row.order_type for row in rows}
            for row in rows:
                row.volume = Decimal(_lot(spec["unit"], p_index, s_index))
            for bit, order_type in ((0, OrderType.ASK), (1, OrderType.BID)):
                if order_type in have:
                    continue
                shift = 1 + (((p_index * 7 + s_index * 3 + bit * 5) % 9) - 4) / 100
                created = now - timedelta(days=(p_index * 8 + s_index + bit * 2) * 5 % 40)
                db.add(
                    Offer(
                        product_id=product.id,
                        region_id=regions[REGIONS[(p_index + s_index + bit * 3) % len(REGIONS)]].id,
                        seller_id=seller.id,
                        price=Decimal(round(last_price * shift)),
                        volume=Decimal(_lot(spec["unit"], p_index, s_index + bit)),
                        order_type=order_type,
                        status=OfferStatus.ACTIVE,
                        created_at=created,
                        expires_at=created + timedelta(days=14),
                        payment=PAYMENTS[(p_index + s_index + bit) % len(PAYMENTS)],
                    )
                )


def normalize_phone(raw: str) -> str:
    digits = "".join(char for char in raw if char.isdigit())
    if len(digits) == 9:
        digits = f"998{digits}"
    if len(digits) == 12 and digits.startswith("998"):
        return f"+{digits}"
    raise ValueError("Telefon raqami noto‘g‘ri. +998 va 9 ta raqam yozing.")


def _hash(value: str) -> int:
    return sum(ord(char) for char in value)


def month_list(start: date, count: int) -> list[date]:
    return [date(start.year + (start.month - 1 + index) // 12, (start.month - 1 + index) % 12 + 1, 1) for index in range(count)]


def series(spec: dict, months: list[date]) -> list[tuple[date, int, int]]:
    points: list[tuple[date, int, int]] = []
    last = max(len(months) - 1, 1)
    for index, month in enumerate(months):
        t = index / last
        wave = math.sin((index / 12) * math.pi * 2 + spec["phase"]) * spec["seasonal"]
        drift = spec["base"] * spec["trend"] * t
        stamp = f"{spec['slug']}-{month.strftime('%Y-%m')}"
        noise = ((_hash(stamp) % 9) - 4) * (spec["base"] * 0.003)
        price = max(400, round(spec["base"] + drift + wave + noise))
        harvest = 1 + 0.18 * max(0.0, -math.sin((index / 12) * math.pi * 2 + spec["phase"]))
        volume = round(spec["volume"] * (0.82 + ((_hash(f"{month.strftime('%Y-%m')}-{spec['slug']}") % 21) / 50)) * harvest)
        points.append((month, price, volume))
    return points


def _get_or_create(db: Session, model, filters: dict, values: dict):
    row = db.execute(select(model).filter_by(**filters)).scalar_one_or_none()
    if row is None:
        row = model(**values)
        db.add(row)
        db.flush()
    return row


def seed_desk(db: Session) -> dict[str, int]:
    months = month_list(CHART_START, CHART_MONTHS)
    products = {}
    for spec in SPECS:
        product = _get_or_create(
            db,
            Product,
            {"name": spec["name"]},
            {
                "name": spec["name"],
                "slug": spec["slug"],
                "category": spec["category"],
                "unit": spec["unit"],
            },
        )
        if not product.slug:
            product.slug = spec["slug"]
            product.category = spec["category"]
            product.unit = spec["unit"]
        products[spec["slug"]] = product
        bars = {
            bar.date: bar
            for bar in db.execute(select(PriceBar).where(PriceBar.product_id == product.id)).scalars()
        }
        for day, price, volume in series(spec, months):
            existing = bars.get(day)
            if existing is None:
                db.add(PriceBar(product_id=product.id, date=day, price=Decimal(price), volume=Decimal(volume)))
            else:
                existing.price = Decimal(price)
                existing.volume = Decimal(volume)

    regions = {name: _get_or_create(db, Region, {"name": name}, {"name": name}) for name in REGIONS}
    sellers = []
    for name, phone, _verified, _rating, _trades in SELLERS:
        sellers.append(
            _get_or_create(
                db,
                User,
                {"phone": phone},
                {"name": name, "phone": phone, "role": UserRole.BOTH},
            )
        )

    desk_ids = [item.id for item in products.values()]
    existing = db.execute(select(Offer.id).where(Offer.product_id.in_(desk_ids))).first()
    offers_added = 0
    if existing is None:
        now = datetime(2026, 9, 26, tzinfo=timezone.utc)
        for p_index, spec in enumerate(SPECS):
            product = products[spec["slug"]]
            for s_index, seller in enumerate(sellers):
                available = _lot(spec["unit"], p_index, s_index)
                shift = 1 + (((p_index * 7 + s_index * 3) % 9) - 4) / 100
                last_price = series(spec, months)[-1][1]
                created = now - timedelta(days=(p_index * 8 + s_index) * 5 % 48)
                db.add(
                    Offer(
                        product_id=product.id,
                        region_id=regions[REGIONS[(p_index + s_index) % len(REGIONS)]].id,
                        seller_id=seller.id,
                        price=Decimal(round(last_price * shift)),
                        volume=Decimal(available),
                        order_type=OrderType.ASK if s_index % 2 == 0 else OrderType.BID,
                        status=OfferStatus.ACTIVE,
                        created_at=created,
                        expires_at=created + timedelta(days=14),
                    )
                )
                offers_added += 1

    _complete_seed_book(db, products, regions)
    return {"products": len(products), "regions": len(regions), "offers_added": offers_added}


def list_catalog(db: Session) -> list[dict]:
    products = list(
        db.execute(select(Product).where(Product.slug.is_not(None)).order_by(Product.id)).scalars()
    )
    payload: list[dict] = []
    for product in products:
        bars = list(
            db.execute(
                select(PriceBar).where(PriceBar.product_id == product.id).order_by(PriceBar.date)
            ).scalars()
        )
        chart = [
            {
                "date": bar.date.isoformat(),
                "price": int(bar.price),
                "volume": int(bar.volume),
                "month": bar.date.strftime("%Y-%m"),
            }
            for bar in bars
        ]
        last = chart[-1]["price"] if chart else 0
        prev = chart[-2]["price"] if len(chart) > 1 else last
        change = round(((last - prev) / prev) * 100, 1) if prev else 0
        payload.append(
            {
                "id": product.slug,
                "name": product.name,
                "category": product.category,
                "unit": product.unit,
                "image": f"/products/{product.slug}.jpg?v=2",
                "price": last,
                "change": change,
                "chartData": chart,
            }
        )
    return payload


def list_desk_offers(db: Session) -> list[dict]:
    offers = list(
        db.execute(
            select(Offer)
            .options(joinedload(Offer.product), joinedload(Offer.region), joinedload(Offer.seller))
            .join(Product)
            .where(Product.slug.is_not(None), Offer.status == OfferStatus.ACTIVE)
            .order_by(Offer.created_at.desc())
        )
        .unique()
        .scalars()
    )
    seller_meta = {item[0]: item[2:] for item in SELLERS}
    rows: list[dict] = []
    for offer in offers:
        unit = offer.product.unit
        available = int(offer.volume)
        if unit == "kg" and available >= 1000:
            min_qty = 1000
        elif unit == "m":
            min_qty = 20
        else:
            min_qty = 10
        verified, rating, trades = seller_meta.get(offer.seller.name, (False, 96.0, 40))
        rows.append(_offer_row(offer, verified, rating, trades, min_qty))
    return rows


def _offer_row(offer: Offer, verified: bool, rating: float, trades: int, min_qty: int) -> dict:
    available = int(offer.volume)
    return {
        "id": str(offer.id),
        "side": "sell" if offer.order_type == OrderType.ASK else "buy",
        "productId": offer.product.slug,
        "productName": offer.product.name,
        "unit": offer.product.unit,
        "seller": offer.seller.name,
        "phone": offer.seller.phone,
        "verified": verified,
        "rating": rating,
        "trades": trades,
        "price": int(offer.price),
        "available": available,
        "minQty": min_qty,
        "maxQty": available,
        "payment": offer.payment or PAYMENTS[offer.id % len(PAYMENTS)],
        "region": offer.region.name,
        "postedAt": offer.created_at.isoformat(),
    }


def create_desk_offer(db: Session, payload: dict) -> dict:
    phone = normalize_phone(str(payload.get("phone") or ""))
    name = str(payload.get("name") or "").strip() or "Foydalanuvchi"
    slug = str(payload.get("productId") or "")
    region_name = str(payload.get("region") or "").strip()
    side = str(payload.get("side") or "")
    if side not in {"buy", "sell"}:
        raise ValueError("Sotib olish yoki sotishni tanlang.")
    if not region_name:
        raise ValueError("Hududni tanlang.")
    product = db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()
    if product is None:
        raise ValueError("Mahsulot topilmadi.")
    try:
        price = Decimal(str(payload.get("price") or "0"))
        quantity = Decimal(str(payload.get("quantity") or "0"))
    except Exception as exc:
        raise ValueError("Narx va miqdor son bo‘lsin.") from exc
    if price <= 0 or quantity <= 0:
        raise ValueError("Narx va miqdor noldan katta bo‘lsin.")
    region = _get_or_create(db, Region, {"name": region_name}, {"name": region_name})
    user = db.execute(select(User).where(User.phone == phone)).scalar_one_or_none()
    if user is None:
        user = User(name=name, phone=phone, role=UserRole.BOTH)
        db.add(user)
        db.flush()
    payment = str(payload.get("payment") or "Naqd")
    if payment not in PAYMENTS:
        payment = "Naqd"
    offer = Offer(
        product_id=product.id,
        region_id=region.id,
        seller_id=user.id,
        price=price,
        volume=quantity,
        order_type=OrderType.ASK if side == "sell" else OrderType.BID,
        status=OfferStatus.ACTIVE,
        payment=payment,
        expires_at=datetime.now(timezone.utc) + timedelta(days=14),
    )
    db.add(offer)
    db.flush()
    db.refresh(offer)
    offer.product = product
    offer.region = region
    offer.seller = user
    return _offer_row(offer, False, 0, 0, int(quantity))
