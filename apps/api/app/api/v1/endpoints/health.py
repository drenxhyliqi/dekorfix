from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.core.dependencies import DbSession
from app.repositories.health import HealthRepository
from app.schemas.health import DatabaseHealthResponse, HealthResponse
from app.services.health import HealthService

router = APIRouter(prefix="/health", tags=["health"])


def get_health_service(db: DbSession) -> HealthService:
    return HealthService(HealthRepository(db))


@router.get("", response_model=HealthResponse)
def health() -> HealthResponse:
    """Liveness: the API process is up. Does not touch the database."""
    return HealthResponse()


@router.get(
    "/db",
    response_model=DatabaseHealthResponse,
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": DatabaseHealthResponse}},
)
def database_health(
    response: Response,
    service: Annotated[HealthService, Depends(get_health_service)],
) -> DatabaseHealthResponse:
    """Readiness: the API can reach PostgreSQL."""
    result = service.check_database()
    if result.status != "ok":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return result
