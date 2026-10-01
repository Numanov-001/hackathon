from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.clerk_auth import clerk_user_id
from app.models import Subscription
from app.services.access import (
    PREMIUM_PLANS,
    TRIAL_PLANS,
    USER_PLANS,
    maybe_grant_promo_pro,
    plan_payload,
    require_user,
    touch_account,
)
from app.services.desk_catalog import create_desk_offer, list_catalog, list_desk_offers

router = APIRouter(prefix="/desk", tags=["desk"])

PAID = PREMIUM_PLANS


def _plan_for(db: Session, authorization: str | None) -> str:
    user_id = clerk_user_id(authorization)
    if not user_id:
        return "free"
    payload = plan_payload(db, user_id)
    return payload["stored_plan"] if payload["premium"] else "free"


def _require_user(authorization: str | None) -> str:
    user_id = clerk_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Kirish kerak.")
    return user_id


@router.get("/catalog")
def get_catalog(db: Session = Depends(get_db)) -> list[dict]:
    return list_catalog(db)


@router.get("/offers")
def get_desk_offers(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> list[dict]:
    paid = _plan_for(db, authorization) in PAID
    return list_desk_offers(db, include_phone=paid)


@router.get("/plan")
def get_plan(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    user_id = require_user(authorization)
    return plan_payload(db, user_id)


@router.post("/session")
def post_session(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    user_id = require_user(authorization)
    touch_account(
        db,
        user_id,
        name=str(payload.get("name") or "")[:255],
        email=str(payload.get("email") or "")[:255],
    )
    maybe_grant_promo_pro(db, user_id)
    payload = plan_payload(db, user_id)
    db.commit()
    return payload


@router.post("/plan")
def post_plan(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    user_id = require_user(authorization)
    plan = str(payload.get("plan") or "")
    if plan not in USER_PLANS:
        raise HTTPException(status_code=400, detail="Tarif noto‘g‘ri.")
    row = db.get(Subscription, user_id)
    if row is None:
        row = Subscription(clerk_user_id=user_id, plan="free")
        db.add(row)
        db.flush()
    if plan == "free":
        row.status = "cancelled" if row.plan in PAID else "active"
        row.plan = "free"
        row.payment_status = "none"
        db.commit()
        return {**plan_payload(db, user_id), "message": "Bepul tarif."}
    if plan in TRIAL_PLANS:
        maybe_grant_promo_pro(db, user_id)
        db.commit()
        current = plan_payload(db, user_id)
        if current["premium"]:
            current["message"] = "PRO ochildi. Karta so‘ralmaydi."
            return current
        raise HTTPException(status_code=400, detail="Bepul 1 oylik aksiya tugadi yoki allaqachon ishlatilgan.")
    row.payment_status = "pending"
    if row.status != "active" or row.plan not in PAID:
        row.status = "pending"
    db.commit()
    current = plan_payload(db, user_id)
    current["requested"] = plan
    current["message"] = "To‘lov ulanmagan. BUSINESS ni admin yoqadi."
    return current


@router.post("/offers")
def post_desk_offer(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    user_id = require_user(authorization)
    if not plan_payload(db, user_id)["premium"]:
        raise HTTPException(status_code=403, detail="Telefon va e’lon Premium obunada.")
    try:
        created = create_desk_offer(db, payload)
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    created.pop("phone", None)
    return created
