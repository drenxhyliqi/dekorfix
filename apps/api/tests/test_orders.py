import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.models import Order

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


def test_order_is_stored_with_its_lines(db_client: TestClient, session_factory) -> None:
    response = db_client.post("/api/v1/orders", json=ORDER)

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


def test_pickup_drops_the_address(db_client: TestClient, session_factory) -> None:
    response = db_client.post("/api/v1/orders", json={**ORDER, "delivery_method": "pickup"})

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
def test_invalid_orders_are_rejected(db_client: TestClient, change: dict) -> None:
    response = db_client.post("/api/v1/orders", json={**ORDER, **change})

    assert response.status_code == 422
