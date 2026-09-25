from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.search_service import search_offers

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def search(
    q: str,
    region: str | None = None,
    volume: Decimal | None = None,
    max_price: Decimal | None = None,
    db: Session = Depends(get_db),
) -> dict:
    return search_offers(db, q, region, volume, max_price)
