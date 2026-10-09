"""Messages sent from the website's contact form."""

from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ContactTopic(StrEnum):
    PRODUCTS = "products"
    PROJECT = "project"
    ORDER = "order"
    EXPORT = "export"
    OTHER = "other"


class ContactStatus(StrEnum):
    NEW = "new"
    ANSWERED = "answered"
    CLOSED = "closed"


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(16), default=ContactStatus.NEW)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    locale: Mapped[str] = mapped_column(String(5))

    name: Mapped[str] = mapped_column(String(120))
    # At least one of phone and email is given (checked by the schema).
    phone: Mapped[str | None] = mapped_column(String(40))
    email: Mapped[str | None] = mapped_column(String(254))
    company: Mapped[str | None] = mapped_column(String(240))
    city: Mapped[str | None] = mapped_column(String(120))
    topic: Mapped[str] = mapped_column(String(16))
    message: Mapped[str] = mapped_column(Text)
