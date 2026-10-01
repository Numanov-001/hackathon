import csv
import io
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models import Account, AdminSetting, ForecastRow, MarketPrice, Offer, PriceAlert, Product, Subscription, TransportListing
from app.models.enums import OfferStatus, OrderType
from app.services.access import PREMIUM_PLANS, USER_PLANS, activate_premium, plan_payload, require_admin
from app.services.siat_forecast import generate_forecast, list_forecasts
from app.services.siat_parse import SIAT_CROPS
from app.services.siat_sync import last_sync, price_stats, sync_siat_1308

router = APIRouter(prefix="/admin", tags=["admin"])


def _admin(db: Session, authorization: str | None) -> Account:
    return require_admin(db, authorization)


@router.get("/overview")
def overview(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    now = datetime.now(timezone.utc)
    week = now - timedelta(days=7)
    accounts = list(db.execute(select(Account)).scalars())
    subs = list(db.execute(select(Subscription)).scalars())
    premium = 0
    expired = 0
    for row in subs:
        payload = plan_payload(db, row.clerk_user_id)
        if payload["premium"]:
            premium += 1
        if payload["status"] == "expired":
            expired += 1
    active = sum(1 for item in accounts if item.last_activity and item.last_activity.replace(tzinfo=timezone.utc) >= week)
    stats = price_stats(db)
    settings = db.get(AdminSetting, 1)
    listings = db.execute(select(func.count(Offer.id)).where(Offer.order_type == OrderType.ASK, Offer.status == OfferStatus.ACTIVE)).scalar() or 0
    requests = db.execute(select(func.count(Offer.id)).where(Offer.order_type == OrderType.BID, Offer.status == OfferStatus.ACTIVE)).scalar() or 0
    return {
        "total_users": len(accounts),
        "active_users": active,
        "premium_users": premium,
        "expired_subscriptions": expired,
        "total_products": db.execute(select(func.count(Product.id)).where(Product.slug.in_(list(SIAT_CROPS)))).scalar() or 0,
        "p2p_listings": listings,
        "active_requests": requests,
        "alerts": db.execute(select(func.count(PriceAlert.id))).scalar() or 0,
        "transport": db.execute(select(func.count(TransportListing.id))).scalar() or 0,
        "data_records": db.execute(select(func.count(MarketPrice.id))).scalar() or 0,
        "latest_data_update": stats.get("last_sync"),
        "revenue": None,
        "payment_connected": False,
        "site_name": settings.site_name if settings else "marketch.uz",
    }


@router.get("/users")
def users(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    _admin(db, authorization)
    rows = list(db.execute(select(Account).order_by(Account.created_at.desc())).scalars())
    payload = []
    for row in rows:
        plan = plan_payload(db, row.clerk_user_id)
        payload.append(
            {
                "id": row.clerk_user_id,
                "name": row.name,
                "email": row.email,
                "role": row.role,
                "status": row.status,
                "registered": row.created_at.isoformat() if row.created_at else None,
                "last_activity": row.last_activity.isoformat() if row.last_activity else None,
                **plan,
            }
        )
    return payload


@router.patch("/users/{clerk_id}")
def patch_user(
    clerk_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    admin = _admin(db, authorization)
    row = db.get(Account, clerk_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi.")
    if "name" in payload:
        row.name = str(payload.get("name") or "")[:255]
    if "status" in payload:
        status = str(payload.get("status") or "")
        if status not in {"active", "suspended"}:
            raise HTTPException(status_code=400, detail="Holat noto‘g‘ri.")
        if row.clerk_user_id == admin.clerk_user_id and status == "suspended":
            raise HTTPException(status_code=400, detail="O‘z hisobingizni to‘xtatib bo‘lmaydi.")
        row.status = status
    if "role" in payload:
        role = str(payload.get("role") or "")
        if role not in {"user", "admin"}:
            raise HTTPException(status_code=400, detail="Rol noto‘g‘ri.")
        if row.clerk_user_id == admin.clerk_user_id and role != "admin":
            raise HTTPException(status_code=400, detail="O‘z admin huquqingizni olib tashlab bo‘lmaydi.")
        row.role = role
    db.commit()
    return {"ok": True, "role": row.role, "status": row.status, "name": row.name}


@router.post("/users/{clerk_id}/premium")
def set_premium(
    clerk_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    if db.get(Account, clerk_id) is None:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi.")
    action = str(payload.get("action") or "activate")
    plan = str(payload.get("plan") or "premium_monthly")
    if plan not in PREMIUM_PLANS and action != "cancel":
        raise HTTPException(status_code=400, detail="Tarif noto‘g‘ri.")
    row = db.get(Subscription, clerk_id)
    if row is None:
        row = Subscription(clerk_user_id=clerk_id, plan="free")
        db.add(row)
        db.flush()
    if action == "cancel":
        row.plan = "free"
        row.status = "cancelled"
        row.payment_status = "none"
        row.end_date = datetime.now(timezone.utc)
    elif action == "extend":
        months = int(payload.get("months") or 1)
        activate_premium(row, plan if row.plan in PREMIUM_PLANS else plan, months)
        if row.end_date:
            row.end_date = row.end_date + timedelta(days=30 * max(months - 1, 0))
    else:
        months = 12 if plan == "premium_yearly" else int(payload.get("months") or 1)
        activate_premium(row, plan, months)
    db.commit()
    return plan_payload(db, clerk_id)


@router.get("/subscriptions")
def subscriptions(
    status: str | None = None,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    _admin(db, authorization)
    rows = list(db.execute(select(Subscription)).scalars())
    payload = []
    for row in rows:
        account = db.get(Account, row.clerk_user_id)
        item = plan_payload(db, row.clerk_user_id)
        item.update(
            {
                "id": row.clerk_user_id,
                "user": account.name if account else row.clerk_user_id,
                "email": account.email if account else "",
            }
        )
        flag = (status or "all").lower()
        if flag == "all":
            payload.append(item)
        elif flag == "premium" and item["premium"]:
            payload.append(item)
        elif flag == "free" and not item["premium"]:
            payload.append(item)
        elif flag in {"active", "expired", "cancelled"} and item["status"] == flag:
            payload.append(item)
    return payload


@router.get("/products")
def products(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    _admin(db, authorization)
    rows = list(db.execute(select(Product).where(Product.slug.in_(list(SIAT_CROPS))).order_by(Product.id)).scalars())
    payload = []
    for row in rows:
        count = db.execute(select(func.count(MarketPrice.id)).where(MarketPrice.product_id == row.id)).scalar() or 0
        payload.append(
            {
                "id": row.id,
                "slug": row.slug,
                "name": row.name,
                "enabled": bool(row.enabled),
                "emoji": row.emoji,
                "unit": row.unit,
                "records": count,
            }
        )
    return payload


@router.post("/products")
def add_product(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    slug = str(payload.get("slug") or "").strip().lower()
    name = str(payload.get("name") or "").strip()
    if not slug or not name:
        raise HTTPException(status_code=400, detail="Nom va slug kerak.")
    if db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug band.")
    row = Product(
        name=name,
        slug=slug,
        category=str(payload.get("category") or "sabzavot"),
        unit=str(payload.get("unit") or "kg"),
        enabled=True,
        emoji=str(payload.get("emoji") or "")[:8],
    )
    db.add(row)
    db.commit()
    return {"id": row.id, "slug": row.slug, "name": row.name}


@router.patch("/products/{product_id}")
def patch_product(
    product_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    row = db.get(Product, product_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi.")
    if "name" in payload:
        row.name = str(payload["name"])[:255]
    if "enabled" in payload:
        row.enabled = bool(payload["enabled"])
    if "emoji" in payload:
        row.emoji = str(payload["emoji"] or "")[:8]
    db.commit()
    return {"id": row.id, "name": row.name, "enabled": row.enabled, "emoji": row.emoji}


@router.get("/products/{product_id}/history")
def product_history(
    product_id: int,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    _admin(db, authorization)
    rows = list(
        db.execute(select(MarketPrice).where(MarketPrice.product_id == product_id).order_by(MarketPrice.date.desc())).scalars()
    )
    return [
        {
            "date": row.date.isoformat(),
            "price": float(row.price),
            "source": row.source,
            "dataset_id": row.dataset_id,
            "unit": row.unit,
        }
        for row in rows[:240]
    ]


@router.get("/data")
def data_status(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    stats = price_stats(db)
    log = last_sync(db)
    stats["last_sync_log"] = {
        "status": log.status if log else None,
        "message": log.message if log else "",
        "records": log.records if log else 0,
    }
    return stats


@router.post("/data/sync")
def sync_now(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    return sync_siat_1308(db, force=True)


@router.get("/data/export.csv")
def export_csv(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    _admin(db, authorization)
    rows = list(db.execute(select(MarketPrice).order_by(MarketPrice.date, MarketPrice.product_id)).scalars())
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["product_id", "date", "year", "month", "price", "unit", "source", "dataset_id"])
    for row in rows:
        writer.writerow([row.product_id, row.date.isoformat(), row.year, row.month, row.price, row.unit, row.source, row.dataset_id])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=market_prices.csv"},
    )


@router.get("/forecasts")
def forecasts(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    _admin(db, authorization)
    return list_forecasts(db)


@router.post("/forecasts/regenerate")
def regenerate(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    slug = str(payload.get("product") or "pomidor")
    horizon = int(payload.get("horizon") or 6)
    try:
        return generate_forecast(db, slug, horizon)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/forecasts/{forecast_id}")
def delete_forecast(
    forecast_id: int,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    row = db.get(ForecastRow, forecast_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Prognoz topilmadi.")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/settings")
def get_settings(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    row = db.get(AdminSetting, 1)
    if row is None:
        row = AdminSetting(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return {
        "site_name": row.site_name,
        "logo_url": row.logo_url,
        "contact": row.contact,
        "premium_monthly_price": row.premium_monthly_price,
        "premium_yearly_price": row.premium_yearly_price,
        "announcement": row.announcement,
        "refresh_minutes": row.refresh_minutes,
        "features": row.features,
        "trial_claim_until": row.trial_claim_until.isoformat() if row.trial_claim_until else "",
    }


@router.patch("/settings")
def patch_settings(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    row = db.get(AdminSetting, 1)
    if row is None:
        row = AdminSetting(id=1)
        db.add(row)
        db.flush()
    for key in (
        "site_name",
        "logo_url",
        "contact",
        "premium_monthly_price",
        "premium_yearly_price",
        "announcement",
        "features",
    ):
        if key in payload:
            setattr(row, key, str(payload.get(key) or "")[:500])
    if "refresh_minutes" in payload:
        row.refresh_minutes = max(15, int(payload.get("refresh_minutes") or 360))
    if "trial_claim_until" in payload:
        raw = str(payload.get("trial_claim_until") or "").strip()
        row.trial_claim_until = datetime.fromisoformat(raw.replace("Z", "+00:00")) if raw else None
    db.commit()
    db.refresh(row)
    return {
        "site_name": row.site_name,
        "logo_url": row.logo_url,
        "contact": row.contact,
        "premium_monthly_price": row.premium_monthly_price,
        "premium_yearly_price": row.premium_yearly_price,
        "announcement": row.announcement,
        "refresh_minutes": row.refresh_minutes,
        "features": row.features,
        "trial_claim_until": row.trial_claim_until.isoformat() if row.trial_claim_until else "",
    }


@router.get("/p2p")
def p2p_list(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    _admin(db, authorization)
    rows = list(
        db.execute(select(Offer).options(joinedload(Offer.product), joinedload(Offer.region)).order_by(Offer.created_at.desc()))
        .unique()
        .scalars()
    )
    return [
        {
            "id": row.id,
            "product": row.product.name if row.product else "",
            "side": "sell" if row.order_type == OrderType.ASK else "buy",
            "price": float(row.price),
            "volume": float(row.volume),
            "region": row.region.name if row.region else "",
            "status": row.status.value if hasattr(row.status, "value") else str(row.status),
        }
        for row in rows
    ]


@router.post("/p2p/{offer_id}")
def p2p_moderate(
    offer_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    _admin(db, authorization)
    row = db.get(Offer, offer_id)
    if row is None:
        raise HTTPException(status_code=404, detail="E’lon topilmadi.")
    action = str(payload.get("action") or "")
    if action == "approve":
        row.status = OfferStatus.ACTIVE
    elif action in {"reject", "hide", "delete"}:
        row.status = OfferStatus.CANCELLED
    else:
        raise HTTPException(status_code=400, detail="Amal noto‘g‘ri.")
    db.commit()
    return {"ok": True, "status": row.status.value}


@router.get("/transport")
def admin_transport(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    _admin(db, authorization)
    rows = list(db.execute(select(TransportListing).order_by(TransportListing.created_at.desc())).scalars())
    return [
        {
            "id": row.id,
            "vehicle_type": row.vehicle_type,
            "origin": row.origin,
            "destination": row.destination,
            "status": row.status,
        }
        for row in rows
    ]


@router.get("/alerts")
def admin_alerts(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    _admin(db, authorization)
    rows = list(db.execute(select(PriceAlert).order_by(PriceAlert.created_at.desc())).scalars())
    return [
        {
            "id": row.id,
            "user": row.clerk_user_id,
            "product": row.product_slug,
            "condition": row.condition,
            "threshold": float(row.threshold),
        }
        for row in rows
    ]
