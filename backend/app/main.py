import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, alerts, chat, desk, forecast, market, market_prices, offers, products, recommendations, regions, search, siat, users, websocket
from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.services.desk_catalog import seed_desk
from app.services.siat_sync import sync_siat_1308

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_desk(db)
        db.commit()
        sync_siat_1308(db, force=False)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api")
app.include_router(desk.router, prefix="/api")
app.include_router(regions.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(offers.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(market_prices.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(siat.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(websocket.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
