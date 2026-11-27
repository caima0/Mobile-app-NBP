from contextlib import contextmanager
from collections.abc import Iterator

from sqlalchemy import URL, create_engine, text
from sqlalchemy.orm import Session, sessionmaker


class Database:
    def __init__(self, url: URL) -> None:
        self._engine = create_engine(
            url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 5},
        )
        self._session_factory = sessionmaker(
            bind=self._engine,
            expire_on_commit=False,
        )

    @contextmanager
    def session(self) -> Iterator[Session]:
        with self._session_factory() as session:
            yield session

    def ping(self) -> bool:
        with self._engine.connect() as connection:
            return connection.scalar(text("SELECT 1")) == 1

    def dispose(self) -> None:
        self._engine.dispose()
