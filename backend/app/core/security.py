from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.repositories.user_repository import AuthRepository
from app.utils.jwt import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):

    try:
        payload = decode_access_token(token)
        user_id = UUID(payload["sub"])

    except (JWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = await AuthRepository.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user