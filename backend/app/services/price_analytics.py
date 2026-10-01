from calendar import monthrange
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import MarketPrice, Product
from app.services.siat_parse import SIAT_CROPS, SIAT_UNIT


MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"]


def siat_product(db: Session, slug: str) -> Product | None:
    return db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()


def observations(db: Session, product_id: int) -> list[MarketPrice]:
    return list(
        db.execute(
            select(MarketPrice)
            .where(MarketPrice.product_id == product_id, MarketPrice.source == "SIAT")
            .order_by(MarketPrice.date)
        ).scalars()
    )


def _change(current: float, previous: float | None) -> float | None:
    if not previous:
        return None
    return round(((current - previous) / previous) * 100, 2)


def _label(row: MarketPrice) -> str:
    return f"{row.year}-M{row.month:02d}"


def analytics_for(db: Session, slug: str) -> dict:
    product = siat_product(db, slug)
    if product is None:
        raise ValueError("Mahsulot topilmadi.")
    rows = observations(db, product.id)
    if not rows:
        raise ValueError("Narxlar yo‘q.")
    prices = [float(row.price) for row in rows]
    current = rows[-1]
    previous = rows[-2] if len(rows) > 1 else None
    year_ago_date = date(current.year - 1, current.month, 1)
    year_ago = next((row for row in reversed(rows) if row.date == year_ago_date), None)
    min_row = min(rows, key=lambda row: float(row.price))
    max_row = max(rows, key=lambda row: float(row.price))
    avg = round(sum(prices) / len(prices), 2)
    growth = None
    best = -10**9
    for index in range(1, len(rows)):
        prev_p = float(rows[index - 1].price)
        if not prev_p:
            continue
        delta = (float(rows[index].price) - prev_p) / prev_p
        if delta > best:
            best = delta
            growth = rows[index]
    return {
        "product": product.name,
        "slug": product.slug,
        "emoji": product.emoji or SIAT_CROPS.get(slug, {}).get("emoji", ""),
        "unit": current.unit or SIAT_UNIT,
        "source": current.source,
        "dataset_id": current.dataset_id,
        "current_price": float(current.price),
        "current_month": _label(current),
        "previous_price": float(previous.price) if previous else None,
        "previous_month": _label(previous) if previous else None,
        "monthly_change": _change(float(current.price), float(previous.price) if previous else None),
        "year_ago_price": float(year_ago.price) if year_ago else None,
        "yearly_change": _change(float(current.price), float(year_ago.price) if year_ago else None),
        "min_price": float(min_row.price),
        "min_month": _label(min_row),
        "max_price": float(max_row.price),
        "max_month": _label(max_row),
        "average_price": avg,
        "highest_growth_month": _label(growth) if growth else None,
        "highest_growth_percent": round(best * 100, 2) if growth else None,
        "lowest_price_month": _label(min_row),
        "count": len(rows),
        "from_year": rows[0].year,
        "to_year": current.year,
    }


def history_points(db: Session, slug: str, year: int | None) -> dict:
    product = siat_product(db, slug)
    if product is None:
        raise ValueError("Mahsulot topilmadi.")
    if year == 2020:
        has = bool(observations(db, product.id))
        official = any(row.year == 2020 for row in observations(db, product.id))
        return {
            "product": product.name,
            "slug": slug,
            "year": 2020,
            "available": official,
            "message": None if official else "2020-yil uchun ushbu datasetda rasmiy ma'lumot mavjud emas.",
            "points": [],
            "missing_note": "Ma'lumot mavjud emas" if not official else None,
            "has_any": has,
        }
    rows = observations(db, product.id)
    if year:
        rows = [row for row in rows if row.year == year]
    points = []
    prev = None
    for row in rows:
        price = float(row.price)
        change = round(((price - prev) / prev) * 100, 2) if prev else None
        points.append(
            {
                "date": row.date.isoformat(),
                "month": _label(row),
                "month_name": MONTHS_UZ[row.month - 1],
                "price": price,
                "change": change,
                "unit": row.unit or SIAT_UNIT,
            }
        )
        prev = price
    missing = []
    if year and year >= 2021:
        have = {row.month for row in rows}
        for month in range(1, 13):
            if month not in have and date(year, month, monthrange(year, month)[1]) <= date.today():
                missing.append(f"{year}-M{month:02d}")
    return {
        "product": product.name,
        "slug": slug,
        "year": year,
        "available": bool(points),
        "message": None if points else ("Ma'lumot mavjud emas" if year else "Narxlar yo‘q."),
        "points": points,
        "missing": missing,
    }


def catalog_quotes(db: Session) -> list[dict]:
    quotes = []
    for slug, crop in SIAT_CROPS.items():
        product = siat_product(db, slug)
        if product is None or product.enabled is False:
            continue
        rows = observations(db, product.id)
        if len(rows) < 2:
            continue
        current, previous = rows[-1], rows[-2]
        quotes.append(
            {
                "id": slug,
                "name": product.name,
                "emoji": product.emoji or crop["emoji"],
                "category": "sabzavot",
                "unit": "kg",
                "image": f"/products/{slug}.jpg?v=2",
                "price": float(current.price),
                "previousPrice": float(previous.price),
                "change": round(((float(current.price) - float(previous.price)) / float(previous.price)) * 100, 2)
                if previous.price
                else 0,
                "changePercent": round(((float(current.price) - float(previous.price)) / float(previous.price)) * 100, 2)
                if previous.price
                else 0,
                "month": _label(current),
                "chartData": [
                    {
                        "date": row.date.isoformat(),
                        "price": float(row.price),
                        "volume": 0,
                        "month": _label(row),
                    }
                    for row in rows
                ],
            }
        )
    return quotes
