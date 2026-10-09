from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db
from app.main import create_app
from app.models import Base, Order

ORDER = {
    "locale": "sq",
    "customer_name": "  Test Customer ",
    "phone": "+383 44 000 000",
    "email": "customer@example.com",
    "delivery_method": "delivery",
    "city": "Prizren",
    "address": "Rruga e testit 1",
    "items": [
        {"product_slug": "baza", "product_name": "Baza", "pack_kg": 20, "quantity": 3},
        {"product_slug": "styrofix", "product_name": "Styrofix", "pack_kg": None, "quantity": 10},
    ],
}


@pytest.fixture
def session_factory() -> Iterator[sessionmaker[Session]]:
    # One in-memory SQLite database shared by every connection in the test.
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    yield sessionmaker(bind=engine, expire_on_commit=False)
    engine.dispose()


@pytest.fixture
def client(session_factory: sessionmaker[Session]) -> Iterator[TestClient]:
    app = create_app()

    def override_db() -> Iterator[Session]:
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as test_client:
        yield test_client


def test_order_is_stored_with_its_lines(client: TestClient, session_factory) -> None:
    response = client.post("/api/v1/orders", json=ORDER)

    assert response.status_code == 201
    reference = response.json()["reference"]
    assert reference.startswith("DF-") and len(reference) == 9

    with session_factory() as session:
        order = session.scalars(select(Order)).one()
        assert order.reference == reference
        assert order.status == "new"
        assert order.customer_name == "Test Customer"
        assert [(i.product_slug, i.pack_kg, i.quantity) for i in order.items] == [
            ("baza", 20, 3),
            ("styrofix", None, 10),
        ]


def test_pickup_drops_the_address(client: TestClient, session_factory) -> None:
    response = client.post("/api/v1/orders", json={**ORDER, "delivery_method": "pickup"})

    assert response.status_code == 201
    with session_factory() as session:
        order = session.scalars(select(Order)).one()
        assert order.city is None and order.address is None


@pytest.mark.parametrize(
    "change",
    [
        {"items": []},
        {"email": "not-an-email"},
        {"phone": "abc"},
        {"customer_name": "   "},
        {"city": None},
        {"items": [{"product_slug": "Baza!", "product_name": "Baza", "quantity": 1}]},
        {"items": [{"product_slug": "baza", "product_name": "Baza", "quantity": 0}]},
    ],
)
def test_invalid_orders_are_rejected(client: TestClient, change: dict) -> None:
    response = client.post("/api/v1/orders", json={**ORDER, **change})

    assert response.status_code == 422
