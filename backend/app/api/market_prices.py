from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.access import require_premium
from app.services.price_analytics import analytics_for, catalog_quotes, history_points
from app.services.siat_forecast import generate_forecast
from app.services.siat_sync import maybe_sync, price_stats

router = APIRouter(prefix="/market-prices", tags=["market-prices"])


@router.get("/catalog")
def get_catalog(db: Session = Depends(get_db)) -> dict:
    maybe_sync(db)
    quotes = catalog_quotes(db)
    stats = price_stats(db)
    return {
        "products": quotes,
        "source": "SIAT",
        "dataset_id": "1308",
        "latest_month": stats.get("latest_month"),
        "has_2020": stats.get("has_2020"),
        "message_2020": "2020-yil uchun rasmiy ma'lumot mavjud emas.",
    }


@router.get("/history")
def get_history(
    product: str = Query(...),
    year: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> dict:
    maybe_sync(db)
    try:
        return history_points(db, product, year)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/analytics")
def get_analytics(product: str = Query(...), db: Session = Depends(get_db)) -> dict:
    maybe_sync(db)
    try:
        return analytics_for(db, product)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)) -> dict:
    maybe_sync(db)
    return price_stats(db)


@router.post("/forecast")
def post_siat_forecast(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    require_premium(db, authorization)
    slug = str(payload.get("product") or "")
    horizon = int(payload.get("horizon") or 3)
    try:
        return generate_forecast(db, slug, horizon)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
