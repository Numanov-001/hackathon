from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import OfferStatus, OrderType

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.region import Region
    from app.models.user import User


class Offer(Base):
    __tablename__ = "offers"
    __table_args__ = (
        Index("ix_offers_product_region_type_status", "product_id", "region_id", "order_type", "status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), index=True)
    # Intention author: seller for ASK, buyer for BID. Not a marketplace counterparty.
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    volume: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    order_type: Mapped[OrderType] = mapped_column(
        Enum(OrderType, native_enum=False, values_callable=lambda e: [item.value for item in e]),
    )
    status: Mapped[OfferStatus] = mapped_column(
        Enum(OfferStatus, native_enum=False, values_callable=lambda e: [item.value for item in e]),
        default=OfferStatus.ACTIVE,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    product: Mapped["Product"] = relationship(back_populates="offers")
    region: Mapped["Region"] = relationship(back_populates="offers")
    seller: Mapped["User"] = relationship(back_populates="offers")
