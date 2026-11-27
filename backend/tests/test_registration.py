from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import User
from app.security.passwords import Argon2PasswordHasher


def test_registration_creates_user(
    client: TestClient,
    db_session: Session,
) -> None:
    login = "test_" + uuid4().hex
    password = " Example-password-123 "

    response = client.post(
        "/api/v1/auth/register",
        json={"login": f" {login.upper()} ", "password": password},
    )

    assert response.status_code == 201
    body = response.json()
    assert set(body) == {"id", "login", "created_at"}
    assert body["login"] == login
    assert body["created_at"]

    user = db_session.get(User, UUID(body["id"]))
    assert user is not None
    assert user.login == login
    assert user.password_hash != password
    assert Argon2PasswordHasher().verify(password, user.password_hash)


def test_duplicate_login_is_rejected(
    client: TestClient,
    db_session: Session,
) -> None:
    login = "test_" + uuid4().hex
    payload = {"login": login, "password": "Example-password-123"}

    assert client.post(
        "/api/v1/auth/register", json=payload
    ).status_code == 201

    response = client.post(
        "/api/v1/auth/register",
        json={**payload, "login": f" {login.upper()} "},
    )

    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "LOGIN_ALREADY_EXISTS"
    count = db_session.scalar(
        select(func.count()).select_from(User).where(User.login == login)
    )
    assert count == 1


@pytest.mark.parametrize(
    "changes",
    [
        {"login": "ab"},
        {"login": "a" * 51},
        {"login": "invalid login"},
        {"password": "short"},
        {"password": "x" * 129},
        {"role": "admin"},
    ],
)
def test_invalid_registration_does_not_create_user(
    client: TestClient,
    db_session: Session,
    changes: dict[str, str],
) -> None:
    payload = {
        "login": "test_" + uuid4().hex,
        "password": "Example-password-123",
        **changes,
    }
    before = db_session.scalar(select(func.count()).select_from(User))

    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 422
    body = response.json()
    assert set(body) == {"detail"}
    detail = body["detail"]
    assert set(detail) == {"code", "message", "errors"}
    assert detail["code"] == "VALIDATION_ERROR"
    assert detail["message"] == "Request validation failed."
    assert detail["errors"]
    for error in detail["errors"]:
        assert set(error) == {"location", "message", "type"}
        assert payload["password"] not in error["location"]
        assert error["message"] != payload["password"]
        assert error["type"] != payload["password"]

    after = db_session.scalar(select(func.count()).select_from(User))
    assert after == before
