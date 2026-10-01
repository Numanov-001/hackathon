from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.clerk_auth import clerk_user_id
from app.models import PriceBar, Subscription
from app.schemas.forecast import ForecastRead, PredictionRead
from app.services.forecast_service import forecast_product
from app.services.prediction_service import predict_price
from app.services.access import require_premium

router = APIRouter(prefix="/forecast", tags=["forecast"])


class PredictRequest(BaseModel):
    horizon: int = 6


def _require_paid(db: Session, authorization: str | None) -> str:
    account = require_premium(db, authorization)
    return account.clerk_user_id


@router.get("/{product_ref}", response_model=ForecastRead)
def get_forecast(
    product_ref: str,
    region: str | None = None,
    db: Session = Depends(get_db),
) -> ForecastRead:
    try:
        return forecast_product(db, product_ref, region)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{product_ref}/predict", response_model=PredictionRead)
async def post_prediction(
    product_ref: str,
    body: PredictRequest,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> PredictionRead:
    _require_paid(db, authorization)

    horizon = max(1, min(body.horizon, 12))

    # Resolve product and gather price history
    from app.services.market_service import market_history, resolve_product

    try:
        product = resolve_product(db, product_ref)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    # Prefer PriceBar history (matches Desk catalog chart), fallback to market_history
    bars = list(
        db.execute(
            select(PriceBar).where(PriceBar.product_id == product.id).order_by(PriceBar.date)
        ).scalars()
    )
    if bars:
        price_history: list[tuple[str, float]] = [(bar.date.isoformat(), float(bar.price)) for bar in bars]
    else:
        hist = market_history(db, product_ref, None, top_regions=1)
        price_history = []
        if hist.regions:
            for point in hist.regions[0].data:
                price_history.append((point.date, float(point.median_price)))

    current_price = price_history[-1][1] if price_history else 0.0

    return await predict_price(
        product_name=product.name,
        unit=product.unit,
        current_price=current_price,
        history=price_history,
        horizon=horizon,
    )
