from collections.abc import Generator
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.core.database import Base
from app.main import app
from app.models import Offer, OfferStatus, OrderType, Product, Region, User, UserRole


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSession()

    tomato = Product(name="Tomato", category="Meva va sabzavotlar", unit="kg")
    potato = Product(name="Potato", category="Meva va sabzavotlar", unit="kg")
    namangan = Region(name="Namangan")
    andijan = Region(name="Andijan")
    seller = User(name="Seller", phone="+998900000001", role=UserRole.SELLER)
    buyer = User(name="Buyer", phone="+998900000002", role=UserRole.BUYER)
    session.add_all([tomato, potato, namangan, andijan, seller, buyer])
    session.flush()

    now = datetime.now(timezone.utc)
    session.add_all(
        [
            Offer(
                product_id=tomato.id,
                region_id=namangan.id,
                seller_id=seller.id,
                price=Decimal("5000"),
                volume=Decimal("1000"),
                order_type=OrderType.ASK,
                status=OfferStatus.ACTIVE,
                created_at=now,
            ),
            Offer(
                product_id=tomato.id,
                region_id=namangan.id,
                seller_id=seller.id,
                price=Decimal("5100"),
                volume=Decimal("800"),
                order_type=OrderType.ASK,
                status=OfferStatus.ACTIVE,
                created_at=now,
            ),
            Offer(
                product_id=tomato.id,
                region_id=namangan.id,
                seller_id=buyer.id,
                price=Decimal("3000"),
                volume=Decimal("400"),
                order_type=OrderType.BID,
                status=OfferStatus.ACTIVE,
                created_at=now,
            ),
            Offer(
                product_id=tomato.id,
                region_id=namangan.id,
                seller_id=buyer.id,
                price=Decimal("3500"),
                volume=Decimal("400"),
                order_type=OrderType.BID,
                status=OfferStatus.ACTIVE,
                created_at=now,
            ),
            Offer(
                product_id=tomato.id,
                region_id=andijan.id,
                seller_id=seller.id,
                price=Decimal("4800"),
                volume=Decimal("300"),
                order_type=OrderType.ASK,
                status=OfferStatus.ACTIVE,
                created_at=now - timedelta(days=1),
            ),
        ]
    )
    session.commit()
    yield session
    session.close()


@pytest.fixture()
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
