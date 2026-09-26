from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def _engine_kwargs(database_url: str) -> dict:
    if database_url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {}


settings = get_settings()
engine = create_engine(settings.database_url, **_engine_kwargs(settings.database_url))
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_sqlite_columns() -> None:
    if not settings.database_url.startswith("sqlite"):
        return
    with engine.begin() as conn:
        cols = [row[1] for row in conn.execute(text("PRAGMA table_info(products)"))]
        if cols and "slug" not in cols:
            conn.execute(text("ALTER TABLE products ADD COLUMN slug VARCHAR(64)"))
        offer_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(offers)"))]
        if offer_cols and "payment" not in offer_cols:
            conn.execute(text("ALTER TABLE offers ADD COLUMN payment VARCHAR(32)"))


def init_db() -> None:
    import app.models  # noqa: F401 — register metadata

    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_columns()
