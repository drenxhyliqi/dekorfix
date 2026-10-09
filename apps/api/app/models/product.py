"""Catalogue products, managed in the admin and shown on the website when published."""

from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import JSON, Boolean, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ProductCategory(StrEnum):
    ADHESIVES = "adhesives"
    FACADES = "facades"
    BASES = "bases"
    PAINTS = "paints"
    PLASTERS = "plasters"
    MESH = "mesh"


class ProductUnit(StrEnum):
    PACK = "pack"  # bags and buckets, by weight
    ROLL = "roll"  # mesh


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(24), index=True)
    unit: Mapped[str] = mapped_column(String(8), default=ProductUnit.PACK)

    summary_sq: Mapped[str] = mapped_column(String(240))
    summary_en: Mapped[str] = mapped_column(String(240))
    description_sq: Mapped[str | None] = mapped_column(Text)
    description_en: Mapped[str | None] = mapped_column(Text)

    # A site path: /images/products/… (shipped with the site) or /media/products/… (uploaded).
    image: Mapped[str | None] = mapped_column(String(300))
    # Pack sizes in kg, e.g. [5, 20]; empty when none are published yet.
    pack_sizes_kg: Mapped[list[float]] = mapped_column(JSON, default=list)
    # Average coverage in m² per kg; both null when not published.
    coverage_min_m2_per_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    coverage_max_m2_per_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))

    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
