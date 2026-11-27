from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.dependencies import get_unit_of_work
from app.core.config import get_settings
from app.db.unit_of_work import SqlAlchemyUnitOfWork, UnitOfWork
from app.main import create_app


@pytest.fixture
def db_session() -> Iterator[Session]:
    engine = create_engine(get_settings().database_url)

    try:
        with engine.connect() as connection:
            transaction = connection.begin()

            try:
                with Session(
                    bind=connection,
                    join_transaction_mode="create_savepoint",
                    expire_on_commit=False,
                ) as session:
                    yield session
            finally:
                transaction.rollback()
    finally:
        engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    application = create_app()

    def override_unit_of_work() -> Iterator[UnitOfWork]:
        yield SqlAlchemyUnitOfWork(db_session)

    application.dependency_overrides[get_unit_of_work] = (
        override_unit_of_work
    )

    try:
        with TestClient(application) as test_client:
            yield test_client
    finally:
        application.dependency_overrides.clear()