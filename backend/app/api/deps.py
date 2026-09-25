from collections.abc import Generator
from time import time

from fastapi import HTTPException, Request

from app.core.config import get_settings
from app.core.database import SessionLocal

_chat_hits: dict[str, list[float]] = {}


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def limit_chat(request: Request) -> None:
    settings = get_settings()
    ip = request.client.host if request.client else "unknown"
    now = time()
    window = [ts for ts in _chat_hits.get(ip, []) if now - ts < 60]
    if len(window) >= settings.chat_rate_limit_per_minute:
        raise HTTPException(status_code=429, detail="Too many chat requests")
    window.append(now)
    _chat_hits[ip] = window
