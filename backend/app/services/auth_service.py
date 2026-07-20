from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.user_repository import AuthRepository
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate
from app.utils.jwt import create_access_token
from app.utils.password import hash_password, verify_password
from app.models.enums import UserRole

class AuthService:

    @staticmethod
    async def register(db: AsyncSession, request: UserCreate):
        existing_user = await AuthRepository.get_user_by_email(db=db, email=request.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')
        user = User(name=request.name, email=request.email, password=hash_password(request.password), phone=request.phone, role=request.role if request.role else UserRole.EMPLOYEE)
        return await AuthRepository.create_user(db=db, user=user)

    @staticmethod
    async def login(db: AsyncSession, request: LoginRequest) -> TokenResponse:
        user = await AuthRepository.get_user_by_email(db=db, email=request.email)
        if not user:
            raise HTTPException(status_code=401, detail='Invalid email or password')
        if not verify_password(request.password, user.password):
            raise HTTPException(status_code=401, detail='Invalid email or password')
        access_token = create_access_token(data={'sub': str(user.id), 'role': user.role.value})
        return TokenResponse(access_token=access_token)