from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import OfferStatus, OrderType


class OfferCreate(BaseModel):
    product_id: int
    region_id: int
    seller_id: int
    price: Decimal = Field(gt=0)
    volume: Decimal = Field(gt=0)
    order_type: OrderType
    expires_at: datetime | None = None


class OfferRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    region_id: int
    seller_id: int
    seller_name: str
    product: str
    region: str
    price: Decimal
    volume: Decimal
    order_type: OrderType
    status: OfferStatus
    created_at: datetime
    expires_at: datetime | None
