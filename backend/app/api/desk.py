from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.desk_catalog import create_desk_offer, list_catalog, list_desk_offers

router = APIRouter(prefix="/desk", tags=["desk"])


@router.get("/catalog")
def get_catalog(db: Session = Depends(get_db)) -> list[dict]:
    return list_catalog(db)


@router.get("/offers")
def get_desk_offers(db: Session = Depends(get_db)) -> list[dict]:
    return list_desk_offers(db)


@router.post("/offers")
def post_desk_offer(payload: dict, db: Session = Depends(get_db)) -> dict:
    try:
        row = create_desk_offer(db, payload)
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return row
