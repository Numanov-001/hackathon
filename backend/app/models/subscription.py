from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    clerk_user_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    plan: Mapped[str] = mapped_column(String(16), default="free")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
