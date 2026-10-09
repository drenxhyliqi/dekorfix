from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.models.user import AuthSession, User


class UserRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def by_email(self, email: str) -> User | None:
        return self._session.scalar(select(User).where(User.email == email.lower()))

    def add(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        self._session.refresh(user)
        return user

    def add_session(self, auth_session: AuthSession) -> AuthSession:
        self._session.add(auth_session)
        self._session.commit()
        return auth_session

    def session_by_hash(self, token_hash: str) -> AuthSession | None:
        return self._session.scalar(
            select(AuthSession)
            .options(joinedload(AuthSession.user))
            .where(AuthSession.token_hash == token_hash)
        )

    def delete_session(self, token_hash: str) -> None:
        self._session.execute(delete(AuthSession).where(AuthSession.token_hash == token_hash))
        self._session.commit()

    def delete_expired_sessions(self, now: datetime) -> None:
        self._session.execute(delete(AuthSession).where(AuthSession.expires_at < now))
        self._session.commit()

    def save(self) -> None:
        self._session.commit()
