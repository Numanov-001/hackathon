from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.forecast import ForecastRead
from app.services.forecast_service import forecast_product

router = APIRouter(prefix="/forecast", tags=["forecast"])


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
