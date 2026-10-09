from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import DbSession
from app.repositories.contact_messages import ContactMessageRepository
from app.schemas.contact_message import ContactMessageCreate, ContactMessageCreated
from app.services.contact_messages import ContactMessageService

router = APIRouter(prefix="/contact-messages", tags=["contact"])


def get_contact_service(db: DbSession) -> ContactMessageService:
    return ContactMessageService(ContactMessageRepository(db))


@router.post("", response_model=ContactMessageCreated, status_code=status.HTTP_201_CREATED)
def send_contact_message(
    data: ContactMessageCreate,
    service: Annotated[ContactMessageService, Depends(get_contact_service)],
) -> ContactMessageCreated:
    """A message from the website's contact form.

    Reading messages arrives with admin authentication.
    """
    return service.send(data)
