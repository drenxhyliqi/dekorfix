from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status

from app.core.dependencies import DbSession
from app.models.user import User
from app.repositories.users import UserRepository
from app.schemas.auth import LoginRequest, LoginResponse, UserOut
from app.services.auth import AuthService, InvalidCredentials, TooManyAttempts

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db: DbSession) -> AuthService:
    return AuthService(UserRepository(db))


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def bearer_token(authorization: Annotated[str | None, Header()] = None) -> str:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not signed in.")
    return token


BearerToken = Annotated[str, Depends(bearer_token)]


def current_user(token: BearerToken, service: AuthServiceDep) -> User:
    user = service.user_for(token)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired or invalid.")
    return user


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, service: AuthServiceDep) -> LoginResponse:
    """Signs an admin in and returns a session token (valid for 7 days)."""
    try:
        return service.login(data.email, data.password)
    except TooManyAttempts:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS, "Too many attempts. Try again later."
        ) from None
    except InvalidCredentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong email or password.") from None


@router.get("/me", response_model=UserOut)
def me(user: Annotated[User, Depends(current_user)]) -> User:
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token: BearerToken, service: AuthServiceDep) -> Response:
    service.logout(token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
