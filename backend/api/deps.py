# File: backend/api/deps.py

from typing import Generator

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.db.session import SessionLocal
from backend.models.user import User
from backend.models.session import Session as SessionModel
from datetime import datetime

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)


def get_db() -> Generator[Session, None, None]:
    """
    Yields a SQLAlchemy database session and ensures it is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the Bearer JWT token and return the corresponding User record.
    Raises HTTP 401 if token is invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id: str = payload.get("sub")
        jti: str = payload.get("jti")
        token_type: str = payload.get("type")
        if user_id is None or jti is None:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    if token_type != "2fa_temp":
        session_obj = db.query(SessionModel).filter(SessionModel.token_jti == jti).first()
        if session_obj is None:
            raise credentials_exception
            
        if user.strict_ip_binding:
            client_ip = request.client.host if request.client else "127.0.0.1"
            if session_obj.ip_address != client_ip:
                # Session hijacked or IP changed
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="IP address changed. Session terminated due to strict IP binding.",
                )
            
        session_obj.last_active = datetime.utcnow()
        db.commit()

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Enforces that the authenticated user's account is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )
    return current_user