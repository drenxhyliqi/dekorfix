from datetime import datetime
from decimal import Decimal
from typing import Annotated, Self

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.models.product import ProductCategory, ProductUnit

Slug = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", min_length=2, max_length=80
    ),
]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Summary = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=240)]
Description = Annotated[str, StringConstraints(strip_whitespace=True, max_length=4000)] | None
ImagePath = (
    Annotated[str, StringConstraints(pattern=r"^/(images|media)/[A-Za-z0-9_./-]+$", max_length=300)]
    | None
)
PackSize = Annotated[float, Field(gt=0, le=1000)]
Coverage = Annotated[Decimal, Field(gt=0, le=1000, decimal_places=2)] | None


class ProductIn(BaseModel):
    """Everything an admin sets on a product (create and full update)."""

    slug: Slug
    name: Name
    category: ProductCategory
    unit: ProductUnit = ProductUnit.PACK
    summary_sq: Summary
    summary_en: Summary
    description_sq: Description = None
    description_en: Description = None
    image: ImagePath = None
    pack_sizes_kg: Annotated[list[PackSize], Field(max_length=10)] = []
    coverage_min_m2_per_kg: Coverage = None
    coverage_max_m2_per_kg: Coverage = None
    is_published: bool = False
    position: Annotated[int, Field(ge=0, le=10000)] = 0

    @model_validator(mode="after")
    def _check(self) -> Self:
        low, high = self.coverage_min_m2_per_kg, self.coverage_max_m2_per_kg
        if (low is None) != (high is None):
            raise ValueError("Give both coverage values, or neither.")
        if low is not None and high is not None and low > high:
            raise ValueError("Minimum coverage cannot be above the maximum.")
        if self.unit is ProductUnit.ROLL and self.pack_sizes_kg:
            raise ValueError("Products sold by the roll have no pack sizes in kg.")
        self.pack_sizes_kg = sorted(set(self.pack_sizes_kg))
        self.description_sq = self.description_sq or None
        self.description_en = self.description_en or None
        return self


class PublishIn(BaseModel):
    is_published: bool


class ProductOut(ProductIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class PublicProduct(BaseModel):
    """A published product as the website shows it."""

    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    category: str
    unit: str
    summary_sq: str
    summary_en: str
    description_sq: str | None
    description_en: str | None
    image: str | None
    pack_sizes_kg: list[float]
    coverage_min_m2_per_kg: Decimal | None
    coverage_max_m2_per_kg: Decimal | None
    position: int


class UploadOut(BaseModel):
    url: str
