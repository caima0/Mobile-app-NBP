from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_auth_service
from app.core.exceptions import LoginAlreadyExistsError
from app.schemas.auth import RegisterRequest, UserResponse
from app.services.auth import AuthService


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserResponse:
    try:
        return service.register(request)
    except LoginAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "LOGIN_ALREADY_EXISTS",
                "message": "Login is already registered.",
            },
        ) from None