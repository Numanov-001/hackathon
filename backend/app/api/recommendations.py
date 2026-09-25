from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.market_service import resolve_product, resolve_region
from app.services.recommendation_service import recommend_asks

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("")
def get_recommendations(
    product: str = Query(...),
    region: str | None = None,
    volume: Decimal | None = None,
    db: Session = Depends(get_db),
) -> dict:
    try:
        resolved_product = resolve_product(db, product)
        resolved_region = resolve_region(db, region)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    offers = recommend_asks(
        db,
        resolved_product.id,
        resolved_region.id if resolved_region else None,
        volume,
    )
    return {
        "product": resolved_product.name,
        "region": resolved_region.name if resolved_region else None,
        "volume": str(volume) if volume is not None else None,
        "offers": offers,
        "note": "Deterministic ranking. Location can outrank a cheaper offer in another region.",
    }
