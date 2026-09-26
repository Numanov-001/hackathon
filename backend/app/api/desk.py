from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.clerk_auth import clerk_user_id
from app.models import Subscription
from app.services.desk_catalog import create_desk_offer, list_catalog, list_desk_offers

router = APIRouter(prefix="/desk", tags=["desk"])

PAID = {"starter", "business"}
PLANS = {"free", "starter", "business"}


def _plan_for(db: Session, authorization: str | None) -> str:
    user_id = clerk_user_id(authorization)
    if not user_id:
        return "free"
    row = db.get(Subscription, user_id)
    if row and row.plan in PAID:
        return row.plan
    return "free"


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
    user_id = _require_user(authorization)
    row = db.get(Subscription, user_id)
    plan = row.plan if row and row.plan in PLANS else "free"
    return {"plan": plan}


@router.post("/plan")
def post_plan(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    user_id = _require_user(authorization)
    plan = str(payload.get("plan") or "")
    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Tarif noto‘g‘ri.")
    row = db.get(Subscription, user_id)
    if row is None:
        row = Subscription(clerk_user_id=user_id, plan=plan)
        db.add(row)
    else:
        row.plan = plan
    db.commit()
    return {"plan": plan}


@router.post("/offers")
def post_desk_offer(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    user_id = _require_user(authorization)
    row = db.get(Subscription, user_id)
    if row is None or row.plan not in PAID:
        raise HTTPException(status_code=403, detail="Telefon va e’lon Starter tarifida.")
    try:
        created = create_desk_offer(db, payload)
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    created.pop("phone", None)
    return created
