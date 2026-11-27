from typing import Protocol

from sqlalchemy.orm import Session

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
        self._session.flush()

    def commit(self) -> None:
        self._session.commit()

    def rollback(self) -> None:
        self._session.rollback()