from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.database import get_db
from app.core.security import get_current_user
from app.schemas.user import UserResponse
from app.models.user import User
router = APIRouter(prefix='/users', tags=['Users'])

@router.get('', response_model=list[UserResponse])
async def list_users(db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(User).where(User.is_active == True).order_by(User.name.asc()))
    return result.scalars().all()