"""Shop orders placed from the website.

An order is a request: the website shows no prices yet, so Dekorfix confirms
price, delivery and payment with the customer before anything is charged.
Each line keeps the product's slug and name as they were when ordered.
"""

from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class OrderStatus(StrEnum):
    NEW = "new"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DeliveryMethod(StrEnum):
    DELIVERY = "delivery"
    PICKUP = "pickup"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(16), default=OrderStatus.NEW)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    locale: Mapped[str] = mapped_column(String(5))

    customer_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(40))
    email: Mapped[str] = mapped_column(String(254))
    company: Mapped[str | None] = mapped_column(String(240))
    business_number: Mapped[str | None] = mapped_column(String(40))

    delivery_method: Mapped[str] = mapped_column(String(16))
    city: Mapped[str | None] = mapped_column(String(240))
    address: Mapped[str | None] = mapped_column(String(240))
    notes: Mapped[str | None] = mapped_column(Text)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", order_by="OrderItem.id"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_slug: Mapped[str] = mapped_column(String(80))
    product_name: Mapped[str] = mapped_column(String(120))
    # Null when Dekorfix has not published pack sizes for the product yet.
    pack_kg: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    quantity: Mapped[int]

    order: Mapped[Order] = relationship(back_populates="items")
