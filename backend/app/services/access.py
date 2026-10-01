from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.clerk_auth import clerk_user_id
from app.core.config import get_settings
from app.models import Account, AdminSetting, Subscription

PREMIUM_PLANS = {"starter", "business", "premium_monthly", "premium_yearly"}
USER_PLANS = {"free", *PREMIUM_PLANS}
TRIAL_PLANS = {"starter", "premium_monthly"}
PROMO_DAYS = 30
TRIAL_DAYS = 30


def _now() -> datetime:
    return datetime.now(timezone.utc)


def parse_ids(raw: str) -> set[str]:
    return {part.strip().lower() for part in raw.split(",") if part.strip()}


def is_premium_plan(plan: str | None, status: str | None = "active", end_date: datetime | None = None) -> bool:
    if (plan or "") not in PREMIUM_PLANS:
        return False
    if (status or "active") in {"cancelled", "expired", "suspended"}:
        return False
    if end_date is not None:
        end = end_date if end_date.tzinfo else end_date.replace(tzinfo=timezone.utc)
        if end < _now():
            return False
    return True


def require_user(authorization: str | None) -> str:
    user_id = clerk_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Kirish kerak.")
    return user_id


def bootstrap_admin(account: Account) -> bool:
    settings = get_settings()
    ids = parse_ids(settings.admin_clerk_user_ids)
    emails = parse_ids(settings.admin_emails)
    if account.clerk_user_id.lower() in ids:
        return True
    if account.email and account.email.lower() in emails:
        return True
    return False


def touch_account(db: Session, clerk_id: str, *, name: str = "", email: str = "") -> Account:
    row = db.get(Account, clerk_id)
    if row is None:
        row = Account(clerk_user_id=clerk_id, name=name, email=email, role="user", status="active")
        db.add(row)
        db.flush()
    if name:
        row.name = name[:255]
    if email:
        row.email = email[:255]
    row.last_activity = _now()
    ids = parse_ids(get_settings().admin_clerk_user_ids)
    if row.clerk_user_id.lower() in ids:
        row.role = "admin"
        if row.status != "suspended":
            row.status = "active"
    db.flush()
    return row


def require_active_account(db: Session, authorization: str | None, name: str = "", email: str = "") -> Account:
    clerk_id = require_user(authorization)
    account = touch_account(db, clerk_id, name=name, email=email)
    if account.status == "suspended":
        raise HTTPException(status_code=403, detail="Hisob to‘xtatilgan.")
    return account


def require_admin(db: Session, authorization: str | None) -> Account:
    account = require_active_account(db, authorization)
    if account.role != "admin":
        raise HTTPException(status_code=403, detail="Admin huquqi kerak.")
    return account


def plan_payload(db: Session, clerk_id: str) -> dict:
    account = db.get(Account, clerk_id)
    row = db.get(Subscription, clerk_id)
    plan = row.plan if row and row.plan in USER_PLANS else "free"
    status = row.status if row else "active"
    end_date = row.end_date if row else None
    premium = is_premium_plan(plan, status, end_date)
    if end_date is not None and not premium and plan in PREMIUM_PLANS:
        status = "expired"
        if row and row.payment_status == "trial":
            row.payment_status = "due"
    promo = None
    try:
        promo = ensure_promo_window(db)
    except Exception:
        promo = None
    return {
        "plan": plan if premium or plan == "free" else "free",
        "stored_plan": plan,
        "status": status,
        "payment_status": row.payment_status if row else "none",
        "start_date": row.start_date.isoformat() if row and row.start_date else None,
        "end_date": end_date.isoformat() if end_date else None,
        "premium": premium,
        "trial": (row.payment_status == "trial") if row and premium else False,
        "trial_used": (getattr(row, "trial_used", None) or "no") == "yes",
        "card_last4": getattr(row, "card_last4", None) or "",
        "card_exp": getattr(row, "card_exp", None) or "",
        "next_charge_at": row.next_charge_at.isoformat() if row and getattr(row, "next_charge_at", None) else None,
        "promo_open": promo_open(promo),
        "promo_until": promo.trial_claim_until.isoformat() if promo and promo.trial_claim_until else None,
        "role": account.role if account else "user",
        "account_status": account.status if account else "active",
        "created_at": account.created_at.isoformat() if account and account.created_at else None,
        "last_activity": account.last_activity.isoformat() if account and account.last_activity else None,
        "name": account.name if account else "",
        "email": account.email if account else "",
    }


def ensure_promo_window(db: Session) -> AdminSetting:
    row = db.get(AdminSetting, 1)
    if row is None:
        row = AdminSetting(id=1)
        db.add(row)
        db.flush()
    if row.trial_claim_until is None:
        row.trial_claim_until = _now() + timedelta(days=PROMO_DAYS)
        db.flush()
    return row


def promo_open(settings: AdminSetting | None) -> bool:
    if settings is None or settings.trial_claim_until is None:
        return False
    until = settings.trial_claim_until
    if until.tzinfo is None:
        until = until.replace(tzinfo=timezone.utc)
    return until >= _now()


def start_pro_trial(row: Subscription) -> None:
    now = _now()
    ends = now + timedelta(days=TRIAL_DAYS)
    row.plan = "starter"
    row.status = "active"
    row.payment_status = "trial"
    row.trial_used = "yes"
    row.start_date = now
    row.end_date = ends
    row.next_charge_at = ends
    if row.created_at is None:
        row.created_at = now


def maybe_grant_promo_pro(db: Session, clerk_id: str) -> Subscription | None:
    nested = db.begin_nested()
    try:
        row = db.get(Subscription, clerk_id)
        if row is None:
            row = Subscription(clerk_user_id=clerk_id, plan="free")
            db.add(row)
            db.flush()
        if is_premium_plan(row.plan, row.status, row.end_date):
            nested.commit()
            return row
        if not promo_open(ensure_promo_window(db)):
            nested.commit()
            return row
        if (getattr(row, "trial_used", None) or "no") == "yes":
            nested.commit()
            return row
        start_pro_trial(row)
        nested.commit()
        return row
    except Exception:
        nested.rollback()
        return None


def require_premium(db: Session, authorization: str | None) -> Account:
    account = require_active_account(db, authorization)
    payload = plan_payload(db, account.clerk_user_id)
    if not payload["premium"]:
        raise HTTPException(status_code=403, detail="Bu funksiya Premium obunada mavjud.")
    return account


def activate_premium(row: Subscription, plan: str, months: int) -> None:
    now = _now()
    row.plan = plan
    row.status = "active"
    row.payment_status = "manual"
    row.start_date = now
    row.end_date = now + timedelta(days=30 * months)
    if row.created_at is None:
        row.created_at = now
