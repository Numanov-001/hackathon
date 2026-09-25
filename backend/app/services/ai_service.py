import json
import logging
import re
from decimal import Decimal

import httpx

from app.core.config import get_settings
from app.models.enums import OrderType
from app.schemas.chat import SearchIntent

logger = logging.getLogger(__name__)

KEYWORD_PRODUCTS = {
    "помидор": "Tomato",
    "pomidor": "Tomato",
    "tomat": "Tomato",
    "tomato": "Tomato",
    "картошк": "Potato",
    "potato": "Potato",
    "лук": "Onion",
    "piyoz": "Onion",
    "onion": "Onion",
    "огурец": "Cucumber",
    "bodring": "Cucumber",
    "cucumber": "Cucumber",
    "яблок": "Apple",
    "olma": "Apple",
    "apple": "Apple",
}

KEYWORD_REGIONS = {
    "наманган": "Namangan",
    "namangan": "Namangan",
    "ташкент": "Tashkent",
    "tashkent": "Tashkent",
    "андижан": "Andijan",
    "andijan": "Andijan",
    "ферган": "Fergana",
    "fergana": "Fergana",
    "самарканд": "Samarkand",
    "samarkand": "Samarkand",
}


def _fallback_intent(message: str) -> SearchIntent:
    lower = message.lower()
    product = next((name for key, name in KEYWORD_PRODUCTS.items() if key in lower), None)
    region = next((name for key, name in KEYWORD_REGIONS.items() if key in lower), None)

    volume = None
    tons = re.search(r"(\d+[.,]?\d*)\s*(тонн|t\b|ton)", lower)
    kilos = re.search(r"(\d+[.,]?\d*)\s*(кг|kg)", lower)
    if tons:
        volume = Decimal(tons.group(1).replace(",", ".")) * 1000
    elif kilos:
        volume = Decimal(kilos.group(1).replace(",", "."))

    price_match = re.search(r"(дешевле|below|under|<|до)\s*(\d+)", lower)
    max_price = Decimal(price_match.group(2)) if price_match else None

    return SearchIntent(
        product=product,
        region=region,
        volume=volume,
        max_price=max_price,
        order_type=OrderType.ASK,
        raw_query=message,
    )


def parse_intent(message: str) -> tuple[SearchIntent, bool]:
    settings = get_settings()
    if not settings.anthropic_api_key:
        return _fallback_intent(message), False

    prompt = (
        "Extract search intent from a market query. "
        "Return JSON only with keys: product, region, volume_kg, max_price, order_type. "
        "product must be one of Tomato, Potato, Onion, Cucumber, Apple or null. "
        "region one of Namangan, Tashkent, Andijan, Fergana, Samarkand or null. "
        "volume_kg is a number or null. max_price is UZS or null. "
        "order_type is ASK or BID. ASK means user wants to buy existing sell offers. "
        "Do not invent prices. Query: "
        f"{message}"
    )
    try:
        data = _claude_json(prompt)
        return (
            SearchIntent(
                product=data.get("product"),
                region=data.get("region"),
                volume=Decimal(str(data["volume_kg"])) if data.get("volume_kg") else None,
                max_price=Decimal(str(data["max_price"])) if data.get("max_price") else None,
                order_type=OrderType(data.get("order_type") or "ASK"),
                raw_query=message,
            ),
            True,
        )
    except Exception:
        logger.exception("Claude intent parse failed, using fallback")
        return _fallback_intent(message), False


def explain_market(message: str, context: dict) -> tuple[str, bool]:
    settings = get_settings()
    fallback = (
        "Я могу объяснить только уже посчитанные данные платформы. "
        "Цены берутся из P2P-намерений пользователей и синтетической истории, "
        "а не из официального real-time прайса. "
        f"Контекст: {json.dumps(context, ensure_ascii=False, default=str)}"
    )
    if not settings.anthropic_api_key:
        return fallback, False

    prompt = (
        "You are a market intelligence assistant for Uzbekistan agri prices. "
        "Explain the provided backend numbers in simple language. "
        "Never invent prices. Never call user offers an official market price. "
        "Never call this an order book. Never present synthetic history as collected prices. "
        f"User question: {message}\nContext JSON: {json.dumps(context, ensure_ascii=False, default=str)}"
    )
    try:
        return _claude_text(prompt), True
    except Exception:
        logger.exception("Claude chat failed")
        return fallback, False


def _claude_headers() -> dict[str, str]:
    settings = get_settings()
    return {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }


def _claude_text(prompt: str) -> str:
    settings = get_settings()
    payload = {
        "model": settings.anthropic_model,
        "max_tokens": 400,
        "messages": [{"role": "user", "content": prompt}],
    }
    with httpx.Client(timeout=30) as client:
        response = client.post(
            "https://api.anthropic.com/v1/messages",
            headers=_claude_headers(),
            json=payload,
        )
        response.raise_for_status()
        body = response.json()
    return body["content"][0]["text"]


def _claude_json(prompt: str) -> dict:
    text = _claude_text(prompt)
    cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
    return json.loads(cleaned)
