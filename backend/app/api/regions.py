from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Region
from app.schemas.region import RegionCreate, RegionRead

router = APIRouter(prefix="/regions", tags=["regions"])


@router.get("", response_model=list[RegionRead])
def list_regions(db: Session = Depends(get_db)) -> list[Region]:
    return list(db.execute(select(Region).order_by(Region.name)).scalars())


@router.post("", response_model=RegionRead)
def create_region(payload: RegionCreate, db: Session = Depends(get_db)) -> Region:
    existing = db.execute(select(Region).where(Region.name == payload.name)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Region already exists")
    region = Region(**payload.model_dump())
    db.add(region)
    db.commit()
    db.refresh(region)
    return region
