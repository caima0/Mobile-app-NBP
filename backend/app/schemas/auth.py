from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    SecretStr,
    StringConstraints,
    field_validator,
)


Login = Annotated[
    str,
    StringConstraints(
        min_length=3,
        max_length=50,
        pattern=r"^[a-z0-9_.-]+$",
    ),
]


class RegisterRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        hide_input_in_errors=True,
    )

    login: Login
    password: SecretStr = Field(min_length=8, max_length=128)

    @field_validator("login", mode="before")
    @classmethod
    def normalize_login(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    login: str
    created_at: datetime