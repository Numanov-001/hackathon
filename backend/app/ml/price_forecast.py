from decimal import Decimal

import numpy as np

try:
    from sklearn.linear_model import LinearRegression
except ImportError:  # pragma: no cover
    LinearRegression = None


def _predict_next(series: list[float]) -> float:
    x = np.arange(len(series))
    y = np.array(series)
    if LinearRegression is not None:
        model = LinearRegression()
        model.fit(x.reshape(-1, 1), y)
        return float(model.predict(np.array([[len(series)]]))[0])
    slope, intercept = np.polyfit(x, y, 1)
    return float(slope * len(series) + intercept)


def trend_from_prices(prices: list[Decimal]) -> dict:
    series = [float(p) for p in prices if p is not None]
    if len(series) < 3:
        return {
            "trend": "insufficient_data",
            "pct_change": 0.0,
            "pct_change_low": 0.0,
            "pct_change_high": 0.0,
        }

    predicted = _predict_next(series)
    last = series[-1]
    pct = 0.0 if last == 0 else ((predicted - last) / last) * 100

    if pct > 1:
        trend = "up"
    elif pct < -1:
        trend = "down"
    else:
        trend = "flat"

    band = max(1.5, abs(pct) * 0.35)
    return {
        "trend": trend,
        "pct_change": pct,
        "pct_change_low": pct - band,
        "pct_change_high": pct + band,
    }
