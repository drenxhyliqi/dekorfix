from app.models.contact_message import ContactMessage
from app.repositories.contact_messages import ContactMessageRepository
from app.schemas.contact_message import ContactMessageCreate, ContactMessageCreated
from app.utils.references import new_reference


class ContactMessageService:
    def __init__(self, repository: ContactMessageRepository) -> None:
        self._repository = repository

    def send(self, data: ContactMessageCreate) -> ContactMessageCreated:
        message = self._repository.add(
            ContactMessage(
                reference=new_reference("DM", self._repository.reference_exists),
                locale=data.locale,
                name=data.name,
                phone=data.phone,
                email=data.email,
                company=data.company or None,
                city=data.city or None,
                topic=data.topic,
                message=data.message,
            )
        )
        return ContactMessageCreated(reference=message.reference, created_at=message.created_at)
