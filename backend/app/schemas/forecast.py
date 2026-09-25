from pydantic import BaseModel


class ForecastRead(BaseModel):
    product: str
    region: str | None
    method: str
    trend: str
    pct_change_low: float
    pct_change_high: float
    summary: str
    disclaimer: str
