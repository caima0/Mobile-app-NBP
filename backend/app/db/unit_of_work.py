from typing import Protocol

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import LoginAlreadyExistsError
from app.repositories.users import (
    SqlAlchemyUserRepository,
    UserRepository,
)


class UnitOfWork(Protocol):
    @property
    def users(self) -> UserRepository:
        ...

    def flush(self) -> None:
        ...

    def commit(self) -> None:
        ...

    def rollback(self) -> None:
        ...


class SqlAlchemyUnitOfWork:
    def __init__(self, session: Session) -> None:
        self._session = session
        self._users = SqlAlchemyUserRepository(session)

    @property
    def users(self) -> UserRepository:
        return self._users

    def flush(self) -> None:
        try:
            self._session.flush()
        except IntegrityError as error:
            self._handle_integrity_error(error)

    def commit(self) -> None:
        try:
            self._session.commit()
        except IntegrityError as error:
            self._handle_integrity_error(error)

    def rollback(self) -> None:
        self._session.rollback()

    def _handle_integrity_error(self, error: IntegrityError) -> None:
        self._session.rollback()

        diagnostic = getattr(error.orig, "diag", None)
        constraint = getattr(diagnostic, "constraint_name", None)

        if constraint == "uq_users_login":
            raise LoginAlreadyExistsError() from error

        raise error