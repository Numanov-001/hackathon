import re
from datetime import date
from typing import Any

SIAT_CROPS: dict[str, dict[str, Any]] = {
    "pomidor": {
        "name": "Pomidor",
        "emoji": "🍅",
        "aliases": ["pomidor", "помидор", "помидоры", "tomato", "tomatoes"],
    },
    "kartoshka": {
        "name": "Kartoshka",
        "emoji": "🥔",
        "aliases": ["kartoshka", "картофель", "potato", "potatoes"],
    },
    "piyoz": {
        "name": "Piyoz",
        "emoji": "🧅",
        "aliases": ["piyoz", "лук", "onion", "onions"],
    },
    "sabzi": {
        "name": "Sabzi",
        "emoji": "🥕",
        "aliases": ["sabzi", "морковь", "carrot", "carrots"],
    },
}

SIAT_DATASET = "1308"
SIAT_SOURCE = "SIAT"
SIAT_URL = "https://siat.stat.uz/api/sdmx/1308/table/"
SIAT_UNIT = "so'm/kg"


def _norm(value: str) -> str:
    text = value.lower().replace("ʼ", "").replace("'", "").replace("`", "")
    return re.sub(r"[^\wа-яё]+", " ", text, flags=re.IGNORECASE).strip()


def _names(row: dict) -> list[str]:
    values = [row.get(key) for key in ("name", "name_uz", "name_ru", "name_en", "name_uzc")]
    return [_norm(str(item)) for item in values if isinstance(item, str) and item.strip()]


def match_crop(row: dict, aliases: list[str]) -> bool:
    names = _names(row)
    for alias in aliases:
        needle = _norm(alias)
        if any(name == needle or needle in name or name in needle for name in names):
            return True
    return False


def _number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and value == value:
        return float(value)
    if isinstance(value, str) and value.strip():
        try:
            parsed = float(value.replace(" ", "").replace(",", "."))
        except ValueError:
            return None
        return parsed
    return None


def observations(data: Any) -> list[tuple[date, float, str]]:
    if not isinstance(data, list):
        return []
    points: list[tuple[date, float, str]] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        for key, raw in item.items():
            match = re.match(r"^(\d{4})-M?(\d{2})$", str(key), re.I)
            if not match:
                continue
            price = _number(raw)
            if price is None or price <= 0:
                continue
            year, month = int(match.group(1)), int(match.group(2))
            label = f"{year}-M{month:02d}"
            points.append((date(year, month, 1), price, label))
    points.sort(key=lambda row: row[0])
    return points


def parse_siat_table(payload: Any) -> dict[str, list[tuple[date, float, str]]]:
    rows = payload if isinstance(payload, list) else []
    if isinstance(payload, dict) and isinstance(payload.get("data"), list):
        rows = payload["data"]
    found: dict[str, list[tuple[date, float, str]]] = {}
    for slug, crop in SIAT_CROPS.items():
        row = next((item for item in rows if isinstance(item, dict) and match_crop(item, crop["aliases"])), None)
        if not row:
            continue
        series = observations(row.get("data"))
        if series:
            found[slug] = series
    return found
