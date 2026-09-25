from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Product
from app.schemas.product import ProductCreate, ProductRead

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db)) -> list[Product]:
    return list(db.execute(select(Product).order_by(Product.name)).scalars())


@router.post("", response_model=ProductRead)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    existing = db.execute(select(Product).where(Product.name == payload.name)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Product already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
