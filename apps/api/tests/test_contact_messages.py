import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.models import ContactMessage

MESSAGE = {
    "locale": "sq",
    "name": "  Test Visitor ",
    "phone": "+383 44 000 000",
    "email": "",
    "city": "Prizren",
    "topic": "project",
    "message": "We are insulating a house of 180 m² and need advice on the system.",
}


def test_message_is_stored(db_client: TestClient, session_factory) -> None:
    response = db_client.post("/api/v1/contact-messages", json=MESSAGE)

    assert response.status_code == 201
    reference = response.json()["reference"]
    assert reference.startswith("DM-") and len(reference) == 9

    with session_factory() as session:
        message = session.scalars(select(ContactMessage)).one()
        assert message.reference == reference
        assert message.status == "new"
        assert message.name == "Test Visitor"
        assert message.email is None
        assert message.topic == "project"


def test_email_alone_is_enough(db_client: TestClient) -> None:
    response = db_client.post(
        "/api/v1/contact-messages", json={**MESSAGE, "phone": None, "email": "a@example.com"}
    )

    assert response.status_code == 201


@pytest.mark.parametrize(
    "change",
    [
        {"phone": "", "email": ""},
        {"email": "not-an-email"},
        {"name": "  "},
        {"topic": "pricing"},
        {"message": "Too short"},
        {"message": "x" * 2001},
    ],
)
def test_invalid_messages_are_rejected(db_client: TestClient, change: dict) -> None:
    response = db_client.post("/api/v1/contact-messages", json={**MESSAGE, **change})

    assert response.status_code == 422
