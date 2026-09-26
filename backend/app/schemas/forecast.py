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


class PredictionPoint(BaseModel):
    date: str
    price: float
    low: float
    high: float


class PredictionExplanation(BaseModel):
    direction: str
    seasonal: str
    driver: str
    recommendation: str


class PredictionRead(BaseModel):
    product: str
    horizon: int
    predicted_points: list[PredictionPoint]
    trend: str
    explanation: PredictionExplanation
    confidence: str
    best_action: str
    disclaimer: str
