from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=128)
    unit: str = Field(default="kg", max_length=32)


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    unit: str
    created_at: datetime
