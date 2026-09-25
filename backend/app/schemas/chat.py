from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.enums import OrderType


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class SearchIntent(BaseModel):
    product: str | None = None
    region: str | None = None
    volume: Decimal | None = None
    max_price: Decimal | None = None
    order_type: OrderType = OrderType.ASK
    raw_query: str = ""


class ChatResponse(BaseModel):
    reply: str
    intent: SearchIntent | None = None
    used_llm: bool
    offers: list[dict] = Field(default_factory=list)
