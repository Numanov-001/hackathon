from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Offer, OfferStatus, OrderType, Product, Region, User
from app.schemas.offer import OfferCreate, OfferRead


def to_offer_read(offer: Offer) -> OfferRead:
    return OfferRead(
        id=offer.id,
        product_id=offer.product_id,
        region_id=offer.region_id,
        seller_id=offer.seller_id,
        seller_name=offer.seller.name,
        product=offer.product.name,
        region=offer.region.name,
        price=offer.price,
        volume=offer.volume,
        order_type=offer.order_type,
        status=offer.status,
        created_at=offer.created_at,
        expires_at=offer.expires_at,
    )


def list_offers(
    db: Session,
    product_id: int | None = None,
    region_id: int | None = None,
    order_type: OrderType | None = None,
    status: OfferStatus | None = OfferStatus.ACTIVE,
) -> list[Offer]:
    stmt = select(Offer).options(
        joinedload(Offer.product),
        joinedload(Offer.region),
        joinedload(Offer.seller),
    )
    if product_id is not None:
        stmt = stmt.where(Offer.product_id == product_id)
    if region_id is not None:
        stmt = stmt.where(Offer.region_id == region_id)
    if order_type is not None:
        stmt = stmt.where(Offer.order_type == order_type)
    if status is not None:
        stmt = stmt.where(Offer.status == status)
    return list(db.execute(stmt.order_by(Offer.created_at.desc())).unique().scalars())


def create_offer(db: Session, payload: OfferCreate) -> Offer:
    if db.get(Product, payload.product_id) is None:
        raise ValueError("Product not found")
    if db.get(Region, payload.region_id) is None:
        raise ValueError("Region not found")
    if db.get(User, payload.seller_id) is None:
        raise ValueError("User not found")

    offer = Offer(**payload.model_dump())
    db.add(offer)
    db.commit()
    db.refresh(offer)
    offer = db.execute(
        select(Offer)
        .options(joinedload(Offer.product), joinedload(Offer.region), joinedload(Offer.seller))
        .where(Offer.id == offer.id)
    ).unique().scalar_one()
    return offer
