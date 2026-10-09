from datetime import datetime
from typing import Annotated, Literal, Self

from pydantic import BaseModel, StringConstraints, field_validator, model_validator

from app.models.contact_message import ContactTopic
from app.schemas.order import Email, OptionalLine, Phone, ShortText

MessageText = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=10, max_length=2000)
]
OptionalCity = Annotated[str, StringConstraints(strip_whitespace=True, max_length=120)] | None


class ContactMessageCreate(BaseModel):
    locale: Literal["sq", "en"]
    name: ShortText
    phone: Phone | None = None
    email: Email | None = None
    company: OptionalLine = None
    city: OptionalCity = None
    topic: ContactTopic
    message: MessageText

    @field_validator("phone", "email", mode="before")
    @classmethod
    def _blank_is_missing(cls, value: object) -> object:
        return None if isinstance(value, str) and not value.strip() else value

    @model_validator(mode="after")
    def _needs_a_way_back(self) -> Self:
        if not (self.phone or self.email):
            raise ValueError("A phone number or an email address is required.")
        return self


class ContactMessageCreated(BaseModel):
    reference: str
    created_at: datetime
