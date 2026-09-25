"""Illustrative monthly CPI-style index for fruits/vegetables.

Not official regional prices from stat.uz. Used only to build
synthetic historical levels: base_price × cumulative_index.
"""

# Month-over-month index, 100 = no change. Values are demo assumptions.
MONTHLY_INDEX = [
    ("2025-01", 101.2),
    ("2025-02", 100.8),
    ("2025-03", 102.1),
    ("2025-04", 101.4),
    ("2025-05", 99.6),
    ("2025-06", 98.9),
    ("2025-07", 99.4),
    ("2025-08", 100.7),
    ("2025-09", 101.8),
    ("2025-10", 102.4),
    ("2025-11", 103.1),
    ("2025-12", 104.0),
    ("2026-01", 102.6),
    ("2026-02", 101.9),
    ("2026-03", 100.5),
    ("2026-04", 99.8),
    ("2026-05", 98.7),
    ("2026-06", 99.2),
    ("2026-07", 100.3),
    ("2026-08", 101.1),
]

# Assumption only — stat.uz series is national, not regional.
REGION_FACTORS = {
    "Namangan": 1.00,
    "Tashkent": 1.08,
    "Andijan": 0.97,
    "Fergana": 0.99,
    "Samarkand": 1.03,
}

BASE_PRICES = {
    "Tomato": 4200,
    "Potato": 2400,
    "Onion": 2100,
    "Cucumber": 4000,
    "Apple": 8200,
}


def synthetic_monthly_prices(product_name: str, region_name: str) -> list[tuple[str, float]]:
    base = BASE_PRICES.get(product_name, 4000)
    factor = REGION_FACTORS.get(region_name, 1.0)
    cumulative = 1.0
    points: list[tuple[str, float]] = []
    for month, index in MONTHLY_INDEX:
        cumulative *= index / 100.0
        points.append((f"{month}-01", round(base * cumulative * factor, 2)))
    return points
