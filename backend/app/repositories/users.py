from typing import Protocol
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User


class UserRepository(Protocol):
    def get_by_id(self, user_id: UUID) -> User | None:
        ...

    def get_by_login(self, login: str) -> User | None:
        ...

    def add(self, user: User) -> None:
        ...


class SqlAlchemyUserRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, user_id: UUID) -> User | None:
        return self._session.get(User, user_id)

    def get_by_login(self, login: str) -> User | None:
        statement = select(User).where(User.login == login)
        return self._session.scalar(statement)

    def add(self, user: User) -> None:
        self._session.add(user)