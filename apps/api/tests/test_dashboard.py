from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.models import ContactMessage, Order, OrderItem

NOW = datetime.now(UTC)


def order(ref: str, days_ago: float, items: list[tuple[str, int]], status: str = "new") -> Order:
    return Order(
        reference=ref,
        status=status,
        created_at=NOW - timedelta(days=days_ago),
        locale="sq",
        customer_name=f"Customer {ref}",
        phone="+383 44 000 000",
        email="c@example.com",
        delivery_method="pickup",
        items=[
            OrderItem(product_slug=slug, product_name=slug.title(), pack_kg=None, quantity=qty)
            for slug, qty in items
        ],
    )


def message(ref: str, days_ago: float, topic: str) -> ContactMessage:
    return ContactMessage(
        reference=ref,
        created_at=NOW - timedelta(days=days_ago),
        locale="sq",
        name=f"Visitor {ref}",
        phone="+383 44 000 000",
        topic=topic,
        message="A message long enough to pass.",
    )


def test_dashboard_needs_a_session(db_client: TestClient) -> None:
    assert db_client.get("/api/v1/admin/dashboard").status_code == 401


def test_dashboard_counts_the_period(
    db_client: TestClient, session_factory: sessionmaker[Session], admin_headers: dict[str, str]
) -> None:
    with session_factory() as session:
        session.add_all(
            [
                order("DF-A", 1, [("baza", 3), ("cerafix", 2)]),
                order("DF-B", 3, [("baza", 5)], status="confirmed"),
                order("DF-C", 10, [("cerafix", 1)]),  # previous 7 days
                message("DM-A", 0.5, "project"),
                message("DM-B", 2, "products"),
            ]
        )
        session.commit()

    stats = db_client.get("/api/v1/admin/dashboard?days=7", headers=admin_headers).json()

    assert stats["period_days"] == 7
    assert stats["orders"]["total"] == 2
    assert stats["orders"]["previous_total"] == 1
    assert stats["orders"]["new_count"] == 1
    assert stats["orders"]["all_time"] == 3
    assert len(stats["orders"]["series"]) == 7
    assert sum(day["count"] for day in stats["orders"]["series"]) == 2
    assert stats["messages"]["total"] == 2
    assert stats["messages_by_topic"]["project"] == 1
    assert stats["orders_by_status"]["confirmed"] == 1
    assert stats["top_products"][0] == {"slug": "baza", "name": "Baza", "quantity": 8, "orders": 2}
    assert [o["reference"] for o in stats["recent_orders"]] == ["DF-A", "DF-B", "DF-C"]


def test_dashboard_period_must_be_known(
    db_client: TestClient, admin_headers: dict[str, str]
) -> None:
    assert (
        db_client.get("/api/v1/admin/dashboard?days=12", headers=admin_headers).status_code == 422
    )
