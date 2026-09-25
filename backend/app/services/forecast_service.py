from decimal import Decimal

from sqlalchemy.orm import Session

from app.ml.price_forecast import trend_from_prices
from app.schemas.forecast import ForecastRead
from app.services.market_service import market_history, resolve_product, resolve_region


def forecast_product(db: Session, product_ref: str, region_ref: str | None = None) -> ForecastRead:
    product = resolve_product(db, product_ref)
    region = resolve_region(db, region_ref)
    history = market_history(db, product_ref, region_ref, top_regions=1)
    series: list[Decimal] = []
    if history.regions:
        series = [point.median_price for point in history.regions[0].data]

    stats = trend_from_prices(series)
    low = round(stats["pct_change_low"], 1)
    high = round(stats["pct_change_high"], 1)
    if stats["trend"] == "insufficient_data":
        summary = "Недостаточно точек для технического тренда."
    elif stats["trend"] == "up":
        summary = f"Ожидается рост примерно на {abs(low):.0f}–{abs(high):.0f}%."
    elif stats["trend"] == "down":
        summary = f"Ожидается снижение примерно на {abs(high):.0f}–{abs(low):.0f}%."
    else:
        summary = "Существенного изменения тренда не видно."

    return ForecastRead(
        product=product.name,
        region=region.name if region else None,
        method="LinearRegression technical price trend analysis",
        trend=stats["trend"],
        pct_change_low=low,
        pct_change_high=high,
        summary=summary,
        disclaimer=(
            "This is a technical trend range, not an exact future price. "
            "Part of the history is a synthetic model estimate."
        ),
    )
