from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    clerk_user_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    plan: Mapped[str] = mapped_column(String(32), default="free")
    status: Mapped[str] = mapped_column(String(16), default="active")
    payment_status: Mapped[str] = mapped_column(String(16), default="none")
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    trial_used: Mapped[str] = mapped_column(String(8), default="no")
    card_last4: Mapped[str] = mapped_column(String(4), default="")
    card_exp: Mapped[str] = mapped_column(String(7), default="")
    card_holder: Mapped[str] = mapped_column(String(120), default="")
    next_charge_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
