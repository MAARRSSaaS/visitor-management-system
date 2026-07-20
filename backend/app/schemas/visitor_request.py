from datetime import date, datetime
from uuid import UUID
from typing import Any
from pydantic import BaseModel, field_validator
from app.schemas.user import UserResponse

class VisitorLogMinimal(BaseModel):
    id: UUID
    check_in_time: datetime | None = None
    check_out_time: datetime | None = None
    is_active: bool

    class Config:
        from_attributes = True

class VisitorRequestCreate(BaseModel):
    visitor_name: str
    visitor_email: str
    visitor_phone: str
    company: str | None = None
    purpose: str
    visit_date: date
    remarks: str | None = None
    host_employee_id: UUID | None = None

    @field_validator('host_employee_id', mode='before')
    @classmethod
    def empty_str_to_none(cls, v: Any) -> Any:
        if v == '' or v is None:
            return None
        return v

class VisitorRequestUpdate(BaseModel):
    visitor_name: str | None = None
    visitor_email: str | None = None
    visitor_phone: str | None = None
    company: str | None = None
    purpose: str | None = None
    visit_date: date | None = None
    remarks: str | None = None
    host_employee_id: UUID | None = None

    @field_validator('host_employee_id', mode='before')
    @classmethod
    def empty_str_to_none(cls, v: Any) -> Any:
        if v == '' or v is None:
            return None
        return v

class VisitorRequestResponse(BaseModel):
    id: UUID
    visitor_name: str
    visitor_email: str
    visitor_phone: str
    company: str | None
    purpose: str
    visit_date: date
    remarks: str | None
    status: str
    host_employee_id: UUID
    created_at: datetime
    host_employee: UserResponse | None = None
    visitor_log: VisitorLogMinimal | None = None

    class Config:
        from_attributes = True

class PaginatedVisitorRequests(BaseModel):
    total: int
    items: list[VisitorRequestResponse]
    page: int
    limit: int