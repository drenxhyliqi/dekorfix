from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db
from app.core.security import hash_password
from app.main import create_app
from app.models import Base, User
from app.services.auth import login_attempts


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client


@pytest.fixture
def session_factory() -> Iterator[sessionmaker[Session]]:
    # One in-memory SQLite database shared by every connection in the test.
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    yield sessionmaker(bind=engine, expire_on_commit=False)
    engine.dispose()


@pytest.fixture
def db_client(session_factory: sessionmaker[Session]) -> Iterator[TestClient]:
    """A client whose requests use the in-memory database."""
    app = create_app()

    def override_db() -> Iterator[Session]:
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin_headers(db_client: TestClient, session_factory: sessionmaker[Session]) -> dict[str, str]:
    """An Authorization header for a signed-in admin."""
    login_attempts.clear()
    with session_factory() as session:
        session.add(
            User(email="admin@example.com", name="Admin", password_hash=hash_password("pw"))
        )
        session.commit()
    response = db_client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "pw"}
    )
    return {"Authorization": f"Bearer {response.json()['token']}"}
