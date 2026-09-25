from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.websocket import manager
from app.models.enums import OfferStatus, OrderType
from app.schemas.offer import OfferCreate, OfferRead
from app.services.offer_service import create_offer, list_offers, to_offer_read

router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("", response_model=list[OfferRead])
def get_offers(
    product_id: int | None = None,
    region_id: int | None = None,
    order_type: OrderType | None = None,
    status: OfferStatus | None = OfferStatus.ACTIVE,
    db: Session = Depends(get_db),
) -> list[OfferRead]:
    return [to_offer_read(offer) for offer in list_offers(db, product_id, region_id, order_type, status)]


@router.post("", response_model=OfferRead)
async def post_offer(payload: OfferCreate, db: Session = Depends(get_db)) -> OfferRead:
    try:
        offer = create_offer(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    read = to_offer_read(offer)
    await manager.broadcast(
        {
            "type": "new_offer",
            "data": {
                "id": read.id,
                "product": read.product,
                "region": read.region,
                "price": str(read.price),
                "volume": str(read.volume),
                "order_type": read.order_type.value,
            },
        }
    )
    return read
