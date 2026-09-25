from decimal import Decimal

from pydantic import BaseModel


class MedianPoint(BaseModel):
    date: str
    median_price: Decimal
    source: str


class RegionHistory(BaseModel):
    region: str
    data: list[MedianPoint]


class MarketHistory(BaseModel):
    product: str
    unit: str
    disclaimer: str
    regions: list[RegionHistory]


class MarketSummary(BaseModel):
    product: str
    region: str | None
    unit: str
    best_ask: Decimal | None
    best_bid: Decimal | None
    spread: Decimal | None
    active_asks: int
    active_bids: int
    note: str
