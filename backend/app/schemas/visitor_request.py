from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class VisitorRequestCreate(BaseModel):

    visitor_name: str

    visitor_email: str

    visitor_phone: str

    company: str | None = None

    purpose: str

    visit_date: date

    remarks: str | None = None



class VisitorRequestUpdate(BaseModel):

    visitor_name: str | None = None

    visitor_email: str | None = None

    visitor_phone: str | None = None

    company: str | None = None

    purpose: str | None = None

    visit_date: date | None = None

    remarks: str | None = None



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


    class Config:
        from_attributes = True