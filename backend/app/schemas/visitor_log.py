from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from app.schemas.user import UserResponse

class VisitorRequestInLog(BaseModel):
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

    class Config:
        from_attributes = True

class VisitorLogResponse(BaseModel):
    id: UUID
    visitor_request_id: UUID
    check_in_time: datetime | None = None
    check_out_time: datetime | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    visitor_request: VisitorRequestInLog | None = None

    class Config:
        from_attributes = True

class PaginatedVisitorLogs(BaseModel):
    total: int
    items: list[VisitorLogResponse]
    page: int
    limit: int