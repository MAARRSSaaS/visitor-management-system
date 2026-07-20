from __future__ import annotations
from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
from app.models.enums import UserRole
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.visitor_request import VisitorRequest

class User(BaseModel):
    __tablename__ = 'users'
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name='user_role_enum'), nullable=False, default=UserRole.EMPLOYEE)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    visitor_requests: Mapped[list['VisitorRequest']] = relationship(back_populates='host_employee', cascade='all, delete-orphan')