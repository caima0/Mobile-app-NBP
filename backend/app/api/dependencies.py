from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Request

from app.db.unit_of_work import SqlAlchemyUnitOfWork, UnitOfWork
from app.security.passwords import PasswordHasher
from app.services.auth import AuthService


def get_unit_of_work(request: Request) -> Iterator[UnitOfWork]:
    with request.app.state.database.session() as session:
        yield SqlAlchemyUnitOfWork(session)


def get_password_hasher(request: Request) -> PasswordHasher:
    return request.app.state.password_hasher


def get_auth_service(
    unit_of_work: Annotated[UnitOfWork, Depends(get_unit_of_work)],
    password_hasher: Annotated[
        PasswordHasher, Depends(get_password_hasher)
    ],
) -> AuthService:
    return AuthService(unit_of_work, password_hasher)