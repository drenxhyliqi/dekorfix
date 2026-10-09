from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.models.order import Order


class OrderRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def reference_exists(self, reference: str) -> bool:
        return bool(self._session.scalar(select(exists().where(Order.reference == reference))))

    def add(self, order: Order) -> Order:
        self._session.add(order)
        self._session.commit()
        self._session.refresh(order)
        return order
