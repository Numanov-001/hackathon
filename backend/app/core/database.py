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


def _add_column(conn, table: str, column: str, ddl: str) -> None:
    cols = [row[1] for row in conn.execute(text(f"PRAGMA table_info({table})"))]
    if cols and column not in cols:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {ddl}"))


def _ensure_sqlite_columns() -> None:
    if not settings.database_url.startswith("sqlite"):
        return
    with engine.begin() as conn:
        _add_column(conn, "products", "slug", "slug VARCHAR(64)")
        _add_column(conn, "products", "enabled", "enabled BOOLEAN DEFAULT 1")
        _add_column(conn, "products", "emoji", "emoji VARCHAR(8) DEFAULT ''")
        _add_column(conn, "offers", "payment", "payment VARCHAR(32)")
        _add_column(conn, "subscriptions", "status", "status VARCHAR(16) DEFAULT 'active'")
        _add_column(conn, "subscriptions", "payment_status", "payment_status VARCHAR(16) DEFAULT 'none'")
        _add_column(conn, "subscriptions", "start_date", "start_date DATETIME")
        _add_column(conn, "subscriptions", "end_date", "end_date DATETIME")
        _add_column(conn, "subscriptions", "created_at", "created_at DATETIME")
        _add_column(conn, "subscriptions", "trial_used", "trial_used VARCHAR(8) DEFAULT 'no'")
        _add_column(conn, "subscriptions", "card_last4", "card_last4 VARCHAR(4) DEFAULT ''")
        _add_column(conn, "subscriptions", "card_exp", "card_exp VARCHAR(7) DEFAULT ''")
        _add_column(conn, "subscriptions", "card_holder", "card_holder VARCHAR(120) DEFAULT ''")
        _add_column(conn, "subscriptions", "next_charge_at", "next_charge_at DATETIME")
        _add_column(conn, "admin_settings", "trial_claim_until", "trial_claim_until DATETIME")


def init_db() -> None:
    import app.models  # noqa: F401 — register metadata

    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_columns()
