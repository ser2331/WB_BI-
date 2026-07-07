import secrets
from datetime import UTC, datetime, timedelta

import jwt
from jwt.exceptions import InvalidTokenError

from app.config import settings
from app.schemas.auth import AuthUser, UserRole

ALGORITHM = "HS256"


def _users() -> dict[str, tuple[str, UserRole]]:
    return {
        settings.admin_username: (settings.admin_password, UserRole.ADMIN),
        settings.user_username: (settings.user_password, UserRole.USER),
    }


def authenticate_user(username: str, password: str) -> AuthUser | None:
    entry = _users().get(username)
    if not entry:
        return None
    expected_password, role = entry
    if not secrets.compare_digest(password, expected_password):
        return None
    return AuthUser(username=username, role=role)


def create_access_token(user: AuthUser) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": user.username,
        "role": user.role.value,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> AuthUser:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
        if not username or not role:
            raise InvalidTokenError("Invalid payload")
        return AuthUser(username=username, role=UserRole(role))
    except (InvalidTokenError, ValueError) as exc:
        raise ValueError("Недействительный токен") from exc
