from decimal import Decimal

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import PriceAlert, TransportListing
from app.services.access import require_premium, require_user
from app.services.siat_parse import SIAT_CROPS

router = APIRouter(tags=["alerts-transport"])
KINDS = {"above", "below", "change"}


@router.get("/transport")
def list_transport(db: Session = Depends(get_db)) -> list[dict]:
    rows = list(db.execute(select(TransportListing).where(TransportListing.status == "active")).scalars())
    return [
        {
            "id": row.id,
            "vehicle_type": row.vehicle_type,
            "capacity_tonnes": float(row.capacity_tonnes),
            "origin": row.origin,
            "destination": row.destination,
            "price": float(row.price),
            "available_date": row.available_date,
            "company": row.company,
        }
        for row in rows
    ]


@router.get("/alerts")
def list_alerts(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    user_id = require_user(authorization)
    rows = list(db.execute(select(PriceAlert).where(PriceAlert.clerk_user_id == user_id)).scalars())
    return [
        {
            "id": row.id,
            "product": row.product_slug,
            "condition": row.condition,
            "threshold": float(row.threshold),
            "active": row.active == "yes",
        }
        for row in rows
    ]


@router.post("/alerts")
def create_alert(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    account = require_premium(db, authorization)
    slug = str(payload.get("product") or "")
    kind = str(payload.get("condition") or "")
    if slug not in SIAT_CROPS or kind not in KINDS:
        raise HTTPException(status_code=400, detail="Alert noto‘g‘ri.")
    try:
        threshold = Decimal(str(payload.get("threshold")))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Chegara noto‘g‘ri.") from exc
    row = PriceAlert(
        clerk_user_id=account.clerk_user_id,
        product_slug=slug,
        condition=kind,
        threshold=threshold,
        active="yes",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "status": "saved", "telegram": "queued_for_future"}


@router.delete("/alerts/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    user_id = require_user(authorization)
    row = db.get(PriceAlert, alert_id)
    if row is None or row.clerk_user_id != user_id:
        raise HTTPException(status_code=404, detail="Alert topilmadi.")
    db.delete(row)
    db.commit()
    return {"ok": True}
