from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Account(Base):
    __tablename__ = "accounts"

    clerk_user_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), default="")
    email: Mapped[str] = mapped_column(String(255), default="", index=True)
    role: Mapped[str] = mapped_column(String(16), default="user")
    status: Mapped[str] = mapped_column(String(16), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_activity: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class MarketPrice(Base):
    __tablename__ = "market_prices"
    __table_args__ = (UniqueConstraint("product_id", "date", "source", "dataset_id", name="uq_market_prices_obs"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    month: Mapped[int] = mapped_column(Integer)
    price: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    unit: Mapped[str] = mapped_column(String(32), default="so'm/kg")
    source: Mapped[str] = mapped_column(String(32), default="SIAT")
    dataset_id: Mapped[str] = mapped_column(String(16), default="1308")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    product = relationship("Product")


class ForecastRow(Base):
    __tablename__ = "forecasts"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    horizon: Mapped[int] = mapped_column(Integer)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    current_price: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    predicted_price: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    range_low: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    range_high: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    model: Mapped[str] = mapped_column(String(64), default="seasonal_linear")
    status: Mapped[str] = mapped_column(String(16), default="active")
    payload: Mapped[str] = mapped_column(String(8000), default="{}")

    product = relationship("Product")


class DataSyncLog(Base):
    __tablename__ = "data_sync_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(32), default="SIAT")
    dataset_id: Mapped[str] = mapped_column(String(16), default="1308")
    status: Mapped[str] = mapped_column(String(16))
    records: Mapped[int] = mapped_column(Integer, default=0)
    latest_month: Mapped[str] = mapped_column(String(16), default="")
    message: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AdminSetting(Base):
    __tablename__ = "admin_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    site_name: Mapped[str] = mapped_column(String(120), default="marketch.uz")
    logo_url: Mapped[str] = mapped_column(String(500), default="")
    contact: Mapped[str] = mapped_column(String(255), default="")
    premium_monthly_price: Mapped[str] = mapped_column(String(32), default="199000")
    premium_yearly_price: Mapped[str] = mapped_column(String(32), default="1990000")
    announcement: Mapped[str] = mapped_column(String(500), default="")
    refresh_minutes: Mapped[int] = mapped_column(Integer, default=360)
    features: Mapped[str] = mapped_column(String(2000), default="{}")
    trial_claim_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TransportListing(Base):
    __tablename__ = "transport_listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    clerk_user_id: Mapped[str] = mapped_column(String(128), index=True)
    vehicle_type: Mapped[str] = mapped_column(String(80), default="")
    capacity_tonnes: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    origin: Mapped[str] = mapped_column(String(80), default="")
    destination: Mapped[str] = mapped_column(String(80), default="")
    price: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    available_date: Mapped[str] = mapped_column(String(32), default="")
    company: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(16), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    clerk_user_id: Mapped[str] = mapped_column(String(128), index=True)
    product_slug: Mapped[str] = mapped_column(String(64), index=True)
    condition: Mapped[str] = mapped_column(String(16))
    threshold: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    active: Mapped[str] = mapped_column(String(8), default="yes")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class NotificationRow(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    clerk_user_id: Mapped[str] = mapped_column(String(128), index=True)
    channel: Mapped[str] = mapped_column(String(16), default="in_app")
    title: Mapped[str] = mapped_column(String(255), default="")
    body: Mapped[str] = mapped_column(String(1000), default="")
    status: Mapped[str] = mapped_column(String(16), default="queued")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
