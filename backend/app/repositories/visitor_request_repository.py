from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.visitor_request import VisitorRequest
from app.models.user import User

class VisitorRequestRepository:

    @staticmethod
    async def create(db: AsyncSession, visitor_request: VisitorRequest):
        db.add(visitor_request)
        await db.commit()
        await db.refresh(visitor_request)
        result = await db.execute(select(VisitorRequest).options(selectinload(VisitorRequest.host_employee), selectinload(VisitorRequest.visitor_log)).where(VisitorRequest.id == visitor_request.id))
        return result.scalar_one()

    @staticmethod
    async def get_employee_requests(db: AsyncSession, employee_id):
        result = await db.execute(select(VisitorRequest).options(selectinload(VisitorRequest.host_employee), selectinload(VisitorRequest.visitor_log)).where(VisitorRequest.host_employee_id == employee_id).order_by(VisitorRequest.created_at.desc()))
        return result.scalars().all()

    @staticmethod
    async def get_requests_paginated(db: AsyncSession, *, host_employee_id=None, search: str | None=None, status=None, visit_date=None, page: int=1, limit: int=10):
        query = select(VisitorRequest).options(selectinload(VisitorRequest.host_employee), selectinload(VisitorRequest.visitor_log))
        count_query = select(func.count(VisitorRequest.id))
        if search:
            query = query.join(VisitorRequest.host_employee)
            count_query = count_query.join(VisitorRequest.host_employee)
            search_pattern = f'%{search}%'
            search_clause = VisitorRequest.visitor_name.ilike(search_pattern) | VisitorRequest.visitor_email.ilike(search_pattern) | VisitorRequest.visitor_phone.ilike(search_pattern) | VisitorRequest.company.ilike(search_pattern) | VisitorRequest.purpose.ilike(search_pattern) | User.name.ilike(search_pattern)
            query = query.where(search_clause)
            count_query = count_query.where(search_clause)
        if host_employee_id is not None:
            query = query.where(VisitorRequest.host_employee_id == host_employee_id)
            count_query = count_query.where(VisitorRequest.host_employee_id == host_employee_id)
        if status is not None:
            query = query.where(VisitorRequest.status == status)
            count_query = count_query.where(VisitorRequest.status == status)
        if visit_date is not None:
            query = query.where(VisitorRequest.visit_date == visit_date)
            count_query = count_query.where(VisitorRequest.visit_date == visit_date)
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0
        query = query.order_by(VisitorRequest.created_at.desc())
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        items_result = await db.execute(query)
        items = items_result.scalars().all()
        return (total, items)

    @staticmethod
    async def get_by_id(db: AsyncSession, request_id):
        result = await db.execute(select(VisitorRequest).options(selectinload(VisitorRequest.host_employee), selectinload(VisitorRequest.visitor_log)).where(VisitorRequest.id == request_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def delete(db: AsyncSession, visitor_request):
        await db.delete(visitor_request)
        await db.commit()