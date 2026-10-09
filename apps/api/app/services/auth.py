import time
from collections import defaultdict, deque
from datetime import UTC, datetime, timedelta

from app.core.security import DUMMY_HASH, hash_token, new_session_token, verify_password
from app.models.user import AuthSession, User
from app.repositories.users import UserRepository
from app.schemas.auth import LoginResponse, UserOut

SESSION_LIFETIME = timedelta(days=7)


class InvalidCredentials(Exception):
    """Wrong email or password, or an inactive account (deliberately not told apart)."""


class TooManyAttempts(Exception):
    """Too many failed sign-ins for this email recently."""


class LoginAttempts:
    """Failed sign-ins per email in a sliding window (per API process)."""

    def __init__(self, limit: int = 5, window_seconds: int = 15 * 60) -> None:
        self.limit = limit
        self.window = window_seconds
        self._failures: dict[str, deque[float]] = defaultdict(deque)

    def _recent(self, key: str) -> deque[float]:
        failures = self._failures[key]
        cutoff = time.monotonic() - self.window
        while failures and failures[0] < cutoff:
            failures.popleft()
        return failures

    def blocked(self, key: str) -> bool:
        return len(self._recent(key)) >= self.limit

    def fail(self, key: str) -> None:
        self._recent(key).append(time.monotonic())

    def clear(self, key: str | None = None) -> None:
        if key is None:
            self._failures.clear()
        else:
            self._failures.pop(key, None)


login_attempts = LoginAttempts()


def _aware(value: datetime) -> datetime:
    # SQLite (tests) returns naive datetimes; stored values are UTC.
    return value if value.tzinfo else value.replace(tzinfo=UTC)


class AuthService:
    def __init__(self, repository: UserRepository) -> None:
        self._repository = repository

    def login(self, email: str, password: str) -> LoginResponse:
        key = email.lower()
        if login_attempts.blocked(key):
            raise TooManyAttempts
        user = self._repository.by_email(key)
        valid = verify_password(password, user.password_hash if user else DUMMY_HASH)
        if not (user and valid and user.is_active):
            login_attempts.fail(key)
            raise InvalidCredentials
        login_attempts.clear(key)

        now = datetime.now(UTC)
        self._repository.delete_expired_sessions(now)
        token, token_hash = new_session_token()
        expires_at = now + SESSION_LIFETIME
        self._repository.add_session(
            AuthSession(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
        )
        user.last_login_at = now
        self._repository.save()
        return LoginResponse(token=token, expires_at=expires_at, user=UserOut.model_validate(user))

    def user_for(self, token: str) -> User | None:
        auth_session = self._repository.session_by_hash(hash_token(token))
        if not auth_session or _aware(auth_session.expires_at) <= datetime.now(UTC):
            return None
        return auth_session.user if auth_session.user.is_active else None

    def logout(self, token: str) -> None:
        self._repository.delete_session(hash_token(token))
