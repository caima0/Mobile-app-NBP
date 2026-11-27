from app.core.exceptions import LoginAlreadyExistsError
from app.db.unit_of_work import UnitOfWork
from app.models import User
from app.schemas.auth import RegisterRequest, UserResponse
from app.security.passwords import PasswordHasher


class AuthService:
    def __init__(
        self,
        unit_of_work: UnitOfWork,
        password_hasher: PasswordHasher,
    ) -> None:
        self._uow = unit_of_work
        self._password_hasher = password_hasher

    def register(self, request: RegisterRequest) -> UserResponse:
        try:
            existing_user = self._uow.users.get_by_login(request.login)

            if existing_user is not None:
                raise LoginAlreadyExistsError()

            user = User(
                login=request.login,
                password_hash=self._password_hasher.hash(
                    request.password.get_secret_value()
                ),
            )
            self._uow.users.add(user)
            self._uow.flush()

            response = UserResponse.model_validate(user)

            self._uow.commit()
            return response

        except Exception:
            self._uow.rollback()
            raise