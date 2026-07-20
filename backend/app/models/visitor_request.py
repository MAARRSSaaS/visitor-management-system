from __future__ import annotations
from datetime import date
import uuid
from sqlalchemy import Date, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
from app.models.enums import VisitorRequestStatus
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.visitor_log import VisitorLog
    from app.models.user import User

class VisitorRequest(BaseModel):
    __tablename__ = 'visitor_requests'
    visitor_name: Mapped[str] = mapped_column(String(100), nullable=False)
    visitor_email: Mapped[str] = mapped_column(String(255), nullable=False)
    visitor_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    company: Mapped[str] = mapped_column(String(100), nullable=True)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    visit_date: Mapped[date] = mapped_column(Date, nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[VisitorRequestStatus] = mapped_column(Enum(VisitorRequestStatus, name='visitor_request_status_enum'), default=VisitorRequestStatus.PENDING)
    host_employee_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    host_employee: Mapped['User'] = relationship(back_populates='visitor_requests')
    visitor_log: Mapped['VisitorLog'] = relationship(back_populates='visitor_request', uselist=False, cascade='all, delete-orphan')