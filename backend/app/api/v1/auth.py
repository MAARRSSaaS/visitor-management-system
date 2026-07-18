from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter( prefix="/auth",tags=["Authentication"],)


@router.post(
    "/register",
    response_model=UserResponse,
)
async def register(request: UserCreate,db: AsyncSession = Depends(get_db),):
    return await AuthService.register(
        db=db,
        request=request,
    )


@router.post("/login",response_model=TokenResponse,)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    return await AuthService.login(
        db=db,
        request=request,
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
async def me(
    current_user=Depends(get_current_user),
):
    return current_user