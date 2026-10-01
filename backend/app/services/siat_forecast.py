import json
from datetime import date
from decimal import Decimal

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ForecastRow, MarketPrice, Product
from app.services.price_analytics import observations, siat_product

try:
    from sklearn.linear_model import LinearRegression
except ImportError:  # pragma: no cover
    LinearRegression = None


def _add_months(year: int, month: int, count: int) -> tuple[int, int]:
    total = year * 12 + (month - 1) + count
    return total // 12, total % 12 + 1


def _seasonal_forecast(prices: list[tuple[date, float]], horizon: int) -> list[dict]:
    if len(prices) < 6:
        raise ValueError("Prognoz uchun yetarli tarix yo‘q.")
    months = [row[0].month for row in prices]
    values = np.array([row[1] for row in prices], dtype=float)
    x = np.arange(len(values)).reshape(-1, 1)
    if LinearRegression is not None:
        model = LinearRegression()
        model.fit(x, values)
        slope = float(model.coef_[0])
        intercept = float(model.intercept_)
    else:
        slope, intercept = [float(v) for v in np.polyfit(np.arange(len(values)), values, 1)]
    seasonal: dict[int, list[float]] = {}
    for month, price in zip(months, values):
        seasonal.setdefault(month, []).append(float(price))
    month_mean = {key: float(np.mean(items)) for key, items in seasonal.items()}
    overall = float(np.mean(values))
    last_date, last_price = prices[-1]
    residual = float(np.std(values[-12:] if len(values) >= 12 else values))
    points = []
    for step in range(1, horizon + 1):
        year, month = _add_months(last_date.year, last_date.month, step)
        trend = intercept + slope * (len(values) + step - 1)
        seasonal_factor = (month_mean.get(month, overall) / overall) if overall else 1
        mom = 1.0
        if len(values) >= 2 and values[-2]:
            mom = 1 + ((values[-1] - values[-2]) / values[-2]) * 0.25
        price = max(100.0, (0.55 * trend + 0.45 * month_mean.get(month, last_price)) * mom)
        price = price * (0.5 + 0.5 * min(max(seasonal_factor, 0.7), 1.4))
        band = max(residual * 0.8, price * 0.06)
        points.append(
            {
                "date": f"{year}-{month:02d}",
                "price": round(price, 0),
                "low": round(max(100.0, price - band), 0),
                "high": round(price + band, 0),
            }
        )
    return points


def generate_forecast(db: Session, slug: str, horizon: int) -> dict:
    product = siat_product(db, slug)
    if product is None:
        raise ValueError("Mahsulot topilmadi.")
    rows = observations(db, product.id)
    series = [(row.date, float(row.price)) for row in rows]
    horizon = max(1, min(int(horizon), 12))
    points = _seasonal_forecast(series, horizon)
    last = series[-1][1]
    last_point = points[-1]
    payload = {
        "product": product.name,
        "slug": slug,
        "horizon": horizon,
        "predicted_points": points,
        "trend": "up" if last_point["price"] > last else "down" if last_point["price"] < last else "flat",
        "confidence": "o'rta" if len(series) >= 24 else "past",
        "best_action": "Kuzatib turish",
        "disclaimer": "Prognoz — tarixiy ma'lumotlar asosida hisoblangan taxmin.",
        "model": "seasonal_linear",
        "current_price": last,
        "unit": "so'm/kg",
        "explanation": {
            "direction": "Mavsumiy o‘rtacha va chiziqli trend asosida.",
            "seasonal": "O‘tgan yillardagi shu oy o‘rtachasi hisobga olindi.",
            "driver": "Rasmiy SIAT 1308 oylik o‘rtacha narxlari.",
            "recommendation": "Bu taxmin, kafolat emas.",
        },
    }
    row = ForecastRow(
        product_id=product.id,
        horizon=horizon,
        current_price=Decimal(str(round(last, 2))),
        predicted_price=Decimal(str(last_point["price"])),
        range_low=Decimal(str(last_point["low"])),
        range_high=Decimal(str(last_point["high"])),
        model="seasonal_linear",
        status="active",
        payload=json.dumps(payload, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    payload["id"] = row.id
    payload["generated_at"] = row.generated_at.isoformat() if row.generated_at else None
    return payload


def list_forecasts(db: Session) -> list[dict]:
    rows = list(db.execute(select(ForecastRow).order_by(ForecastRow.generated_at.desc())).scalars())
    items = []
    for row in rows:
        product = db.get(Product, row.product_id)
        items.append(
            {
                "id": row.id,
                "product": product.name if product else "",
                "slug": product.slug if product else "",
                "horizon": row.horizon,
                "generated_at": row.generated_at.isoformat() if row.generated_at else None,
                "current_price": float(row.current_price),
                "predicted_price": float(row.predicted_price),
                "range_low": float(row.range_low),
                "range_high": float(row.range_high),
                "model": row.model,
                "status": row.status,
            }
        )
    return items
