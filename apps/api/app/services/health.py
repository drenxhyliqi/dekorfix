import logging

from sqlalchemy.exc import SQLAlchemyError

from app.repositories.health import HealthRepository
from app.schemas.health import DatabaseHealthResponse

logger = logging.getLogger(__name__)


class HealthService:
    def __init__(self, repository: HealthRepository) -> None:
        self._repository = repository

    def check_database(self) -> DatabaseHealthResponse:
        try:
            self._repository.ping()
        except SQLAlchemyError:
            logger.exception("Database health check failed")
            return DatabaseHealthResponse(status="error", database="unavailable")
        return DatabaseHealthResponse(status="ok", database="ok")
