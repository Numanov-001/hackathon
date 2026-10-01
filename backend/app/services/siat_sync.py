from datetime import datetime, timezone
from decimal import Decimal

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import AdminSetting, DataSyncLog, MarketPrice, Product
from app.services.siat_parse import SIAT_CROPS, SIAT_DATASET, SIAT_SOURCE, SIAT_UNIT, SIAT_URL, parse_siat_table

_cache: dict[str, float] = {"ok_at": 0.0}


def refresh_minutes(db: Session) -> int:
    row = db.get(AdminSetting, 1)
    if row and row.refresh_minutes:
        return max(15, int(row.refresh_minutes))
    return max(15, get_settings().siat_refresh_minutes)


def ensure_siat_products(db: Session) -> dict[str, Product]:
    products: dict[str, Product] = {}
    for slug, crop in SIAT_CROPS.items():
        row = db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()
        if row is None:
            row = db.execute(select(Product).where(Product.name == crop["name"])).scalar_one_or_none()
        if row is None:
            row = Product(
                name=crop["name"],
                slug=slug,
                category="sabzavot",
                unit="kg",
                enabled=True,
                emoji=crop["emoji"],
            )
            db.add(row)
            db.flush()
        else:
            row.slug = slug
            row.category = row.category or "sabzavot"
            row.unit = row.unit or "kg"
            if not row.emoji:
                row.emoji = crop["emoji"]
            if row.enabled is None:
                row.enabled = True
        products[slug] = row
    return products


def last_sync(db: Session) -> DataSyncLog | None:
    return db.execute(select(DataSyncLog).order_by(DataSyncLog.created_at.desc())).scalars().first()


def missing_months(series: list) -> list[str]:
    if len(series) < 2:
        return []
    start, end = series[0][0], series[-1][0]
    have = {item[0] for item in series}
    missing: list[str] = []
    year, month = start.year, start.month
    while (year, month) <= (end.year, end.month):
        day = datetime(year, month, 1).date()
        if day not in have:
            missing.append(f"{year}-M{month:02d}")
        month += 1
        if month > 12:
            month = 1
            year += 1
    return missing


def sync_siat_1308(db: Session, *, force: bool = False) -> dict:
    now = datetime.now(timezone.utc)
    latest = last_sync(db)
    ttl = refresh_minutes(db) * 60
    if (
        not force
        and latest
        and latest.status == "ok"
        and latest.created_at
    ):
        created = latest.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if (now - created).total_seconds() < ttl:
            return {"status": "cached", "records": latest.records, "latest_month": latest.latest_month, "message": latest.message}

    log = DataSyncLog(source=SIAT_SOURCE, dataset_id=SIAT_DATASET, status="error", records=0, latest_month="", message="")
    db.add(log)
    try:
        with httpx.Client(timeout=45.0) as client:
            response = client.get(SIAT_URL, headers={"Accept": "application/json"})
        if response.status_code != 200:
            log.message = f"HTTP {response.status_code}"
            db.commit()
            return {"status": "error", "records": 0, "latest_month": "", "message": log.message}
        parsed = parse_siat_table(response.json())
        products = ensure_siat_products(db)
        count = 0
        latest_label = ""
        for slug, series in parsed.items():
            product = products[slug]
            for day, price, label in series:
                existing = db.execute(
                    select(MarketPrice).where(
                        MarketPrice.product_id == product.id,
                        MarketPrice.date == day,
                        MarketPrice.source == SIAT_SOURCE,
                        MarketPrice.dataset_id == SIAT_DATASET,
                    )
                ).scalar_one_or_none()
                if existing:
                    existing.price = Decimal(str(round(price, 2)))
                    existing.unit = SIAT_UNIT
                    existing.year = day.year
                    existing.month = day.month
                    existing.updated_at = now
                else:
                    db.add(
                        MarketPrice(
                            product_id=product.id,
                            date=day,
                            year=day.year,
                            month=day.month,
                            price=Decimal(str(round(price, 2))),
                            unit=SIAT_UNIT,
                            source=SIAT_SOURCE,
                            dataset_id=SIAT_DATASET,
                        )
                    )
                count += 1
                if label > latest_label:
                    latest_label = label
        log.status = "ok"
        log.records = count
        log.latest_month = latest_label
        log.message = "SIAT 1308 yangilandi."
        db.commit()
        _cache["ok_at"] = now.timestamp()
        return {"status": "ok", "records": count, "latest_month": latest_label, "message": log.message}
    except httpx.HTTPError as exc:
        log.message = str(exc)[:500]
        db.commit()
        return {"status": "error", "records": 0, "latest_month": "", "message": log.message}


def maybe_sync(db: Session) -> None:
    sync_siat_1308(db, force=False)


def price_stats(db: Session) -> dict:
    total = db.execute(select(func.count(MarketPrice.id))).scalar() or 0
    latest = db.execute(select(func.max(MarketPrice.date))).scalar()
    failed = db.execute(select(func.count(DataSyncLog.id)).where(DataSyncLog.status != "ok")).scalar() or 0
    last = last_sync(db)
    gaps: list[dict] = []
    products = db.execute(select(Product).where(Product.slug.in_(list(SIAT_CROPS)))).scalars()
    for product in products:
        rows = list(
            db.execute(
                select(MarketPrice)
                .where(MarketPrice.product_id == product.id, MarketPrice.source == SIAT_SOURCE)
                .order_by(MarketPrice.date)
            ).scalars()
        )
        series = [(row.date, float(row.price), f"{row.year}-M{row.month:02d}") for row in rows]
        miss = missing_months(series)
        if miss:
            gaps.append({"product": product.name, "months": miss[:24], "count": len(miss)})
    return {
        "records": total,
        "latest_month": latest.strftime("%Y-M%m") if latest else "",
        "failed_requests": failed,
        "last_sync": last.created_at.isoformat() if last and last.created_at else None,
        "last_status": last.status if last else None,
        "last_message": last.message if last else "",
        "missing": gaps,
        "has_2020": bool(
            db.execute(select(func.count(MarketPrice.id)).where(MarketPrice.year == 2020)).scalar()
        ),
    }
