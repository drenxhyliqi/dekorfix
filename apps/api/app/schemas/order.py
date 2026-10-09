from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal, Self

from pydantic import BaseModel, Field, StringConstraints, model_validator

from app.models.order import DeliveryMethod

# Text is trimmed; required text must not be empty, optional text may be blank.
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Phone = Annotated[
    str,
    StringConstraints(strip_whitespace=True, max_length=40, pattern=r"^\+?[0-9 ()./-]{6,}$"),
]
Email = Annotated[
    str,
    StringConstraints(strip_whitespace=True, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$"),
]
OptionalLine = Annotated[str, StringConstraints(strip_whitespace=True, max_length=240)] | None
OptionalCode = Annotated[str, StringConstraints(strip_whitespace=True, max_length=40)] | None
Notes = Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)] | None


class OrderItemIn(BaseModel):
    product_slug: Annotated[str, StringConstraints(pattern=r"^[a-z0-9-]{1,80}$")]
    product_name: ShortText
    # None when the product has no published pack size yet.
    pack_kg: Annotated[Decimal, Field(gt=0, le=1000, decimal_places=2)] | None = None
    quantity: Annotated[int, Field(ge=1, le=9999)]


class OrderCreate(BaseModel):
    locale: Literal["sq", "en"]
    customer_name: ShortText
    phone: Phone
    email: Email
    company: OptionalLine = None
    business_number: OptionalCode = None
    delivery_method: DeliveryMethod
    city: OptionalLine = None
    address: OptionalLine = None
    notes: Notes = None
    items: Annotated[list[OrderItemIn], Field(min_length=1, max_length=50)]

    @model_validator(mode="after")
    def _delivery_needs_an_address(self) -> Self:
        if self.delivery_method is DeliveryMethod.DELIVERY and not (self.city and self.address):
            raise ValueError("City and address are required for delivery.")
        return self


class OrderCreated(BaseModel):
    reference: str
    created_at: datetime
