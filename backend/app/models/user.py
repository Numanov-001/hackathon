from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.offer import Offer


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False, values_callable=lambda e: [item.value for item in e]),
        default=UserRole.BOTH,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    offers: Mapped[list["Offer"]] = relationship(back_populates="seller")
