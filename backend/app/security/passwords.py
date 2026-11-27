from typing import Protocol

from argon2 import PasswordHasher as Argon2Hasher
from argon2.exceptions import VerifyMismatchError
from argon2.low_level import Type


class PasswordHasher(Protocol):
    def hash(self, password: str) -> str:
        ...

    def verify(self, password: str, password_hash: str) -> bool:
        ...


class Argon2PasswordHasher:
    def __init__(self) -> None:
        self._hasher = Argon2Hasher(type=Type.ID)

    def hash(self, password: str) -> str:
        return self._hasher.hash(password)

    def verify(self, password: str, password_hash: str) -> bool:
        try:
            return self._hasher.verify(password_hash, password)
        except VerifyMismatchError:
            return False