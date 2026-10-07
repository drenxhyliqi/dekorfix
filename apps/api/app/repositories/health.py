from sqlalchemy import text
from sqlalchemy.orm import Session


class HealthRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def ping(self) -> None:
        """Round-trip to the database. Raises on connection failure."""
        self._session.execute(text("SELECT 1"))
