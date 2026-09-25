from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.market import MarketHistory, MarketSummary
from app.services.market_service import market_history, market_summary

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/{product_ref}/history", response_model=MarketHistory)
def get_history(
    product_ref: str,
    region: str | None = None,
    db: Session = Depends(get_db),
) -> MarketHistory:
    try:
        return market_history(db, product_ref, region)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{product_ref}/summary", response_model=MarketSummary)
def get_summary(
    product_ref: str,
    region: str | None = None,
    db: Session = Depends(get_db),
) -> MarketSummary:
    try:
        return market_summary(db, product_ref, region)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
