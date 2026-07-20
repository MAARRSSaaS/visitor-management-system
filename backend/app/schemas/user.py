from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from app.models.enums import UserRole

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    role: UserRole

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    email: EmailStr
    phone: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime