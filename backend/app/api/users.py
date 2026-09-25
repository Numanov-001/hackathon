from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return list(db.execute(select(User).order_by(User.id)).scalars())


@router.post("", response_model=UserRead)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    existing = db.execute(select(User).where(User.phone == payload.phone)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Phone already registered")
    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
