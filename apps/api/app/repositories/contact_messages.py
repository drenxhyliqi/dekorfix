from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.models.contact_message import ContactMessage


class ContactMessageRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def reference_exists(self, reference: str) -> bool:
        return bool(
            self._session.scalar(select(exists().where(ContactMessage.reference == reference)))
        )

    def add(self, message: ContactMessage) -> ContactMessage:
        self._session.add(message)
        self._session.commit()
        self._session.refresh(message)
        return message
