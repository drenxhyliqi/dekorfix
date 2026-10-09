from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.contact_message import ContactMessage
from app.models.order import Order
from app.models.product import Product


class DashboardRepository:
    """Reads for the admin dashboard. Volumes are small, so rows in the window are loaded and
    aggregated in Python (day buckets in local time work the same on PostgreSQL and SQLite)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def orders_since(self, since: datetime) -> list[Order]:
        return list(
            self._session.scalars(
                select(Order)
                .options(selectinload(Order.items))
                .where(Order.created_at >= since)
                .order_by(Order.created_at.desc())
            )
        )

    def messages_since(self, since: datetime) -> list[ContactMessage]:
        return list(
            self._session.scalars(
                select(ContactMessage)
                .where(ContactMessage.created_at >= since)
                .order_by(ContactMessage.created_at.desc())
            )
        )

    def count_orders(self) -> int:
        return self._session.scalar(select(func.count(Order.id))) or 0

    def count_messages(self) -> int:
        return self._session.scalar(select(func.count(ContactMessage.id))) or 0

    def recent_orders(self, limit: int) -> list[Order]:
        return list(
            self._session.scalars(
                select(Order)
                .options(selectinload(Order.items))
                .order_by(Order.created_at.desc())
                .limit(limit)
            )
        )

    def recent_messages(self, limit: int) -> list[ContactMessage]:
        return list(
            self._session.scalars(
                select(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(limit)
            )
        )

    def products(self) -> list[Product]:
        return list(self._session.scalars(select(Product)))
