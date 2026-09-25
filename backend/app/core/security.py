from fastapi import Header, HTTPException

from app.core.database import SessionLocal
from app.models import User


def get_user_by_id(user_id: int) -> User:
    db = SessionLocal()
    try:
        user = db.get(User, user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        db.close()


def get_optional_user_id(x_user_id: int | None = Header(default=None)) -> int | None:
    return x_user_id
