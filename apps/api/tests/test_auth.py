from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.core.security import hash_password, verify_password
from app.models import User
from app.services.auth import login_attempts

EMAIL = "admin@example.com"
PASSWORD = "correct horse battery staple"


@pytest.fixture(autouse=True)
def fresh_attempts() -> Iterator[None]:
    login_attempts.clear()
    yield
    login_attempts.clear()


@pytest.fixture
def admin(session_factory: sessionmaker[Session]) -> None:
    with session_factory() as session:
        session.add(User(email=EMAIL, name="Admin", password_hash=hash_password(PASSWORD)))
        session.commit()


def login(client: TestClient, email: str = EMAIL, password: str = PASSWORD):
    return client.post("/api/v1/auth/login", json={"email": email, "password": password})


def test_password_hashing() -> None:
    stored = hash_password(PASSWORD)
    assert stored.startswith("scrypt$") and PASSWORD not in stored
    assert verify_password(PASSWORD, stored)
    assert not verify_password("wrong", stored)
    assert not verify_password(PASSWORD, "not-a-hash")


@pytest.mark.usefixtures("admin")
def test_login_me_and_logout(db_client: TestClient) -> None:
    response = login(db_client, email="Admin@Example.com")
    assert response.status_code == 200
    body = response.json()
    assert body["user"] == {"id": 1, "email": EMAIL, "name": "Admin"}
    headers = {"Authorization": f"Bearer {body['token']}"}

    assert db_client.get("/api/v1/auth/me", headers=headers).json()["email"] == EMAIL
    assert db_client.post("/api/v1/auth/logout", headers=headers).status_code == 204
    assert db_client.get("/api/v1/auth/me", headers=headers).status_code == 401


@pytest.mark.usefixtures("admin")
def test_wrong_password_and_unknown_email_look_the_same(db_client: TestClient) -> None:
    wrong = login(db_client, password="nope")
    unknown = login(db_client, email="nobody@example.com")
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()


def test_inactive_user_cannot_sign_in(db_client: TestClient, session_factory) -> None:
    with session_factory() as session:
        session.add(
            User(email=EMAIL, name="Admin", password_hash=hash_password(PASSWORD), is_active=False)
        )
        session.commit()
    assert login(db_client).status_code == 401


@pytest.mark.usefixtures("admin")
def test_too_many_failures_lock_the_email(db_client: TestClient) -> None:
    for _ in range(5):
        assert login(db_client, password="nope").status_code == 401
    # Even the right password is refused until the window passes.
    assert login(db_client).status_code == 429


def test_me_needs_a_valid_token(db_client: TestClient) -> None:
    assert db_client.get("/api/v1/auth/me").status_code == 401
    bad = {"Authorization": "Bearer not-a-real-token"}
    assert db_client.get("/api/v1/auth/me", headers=bad).status_code == 401
