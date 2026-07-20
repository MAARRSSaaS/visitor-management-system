from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.visitor_log import VisitorLog
from app.models.visitor_request import VisitorRequest
from app.models.user import User

class VisitorLogRepository:

    @staticmethod
    async def get_active_log_by_visitor(db: AsyncSession, email: str, phone: str):
        result = await db.execute(select(VisitorLog).join(VisitorLog.visitor_request).where((VisitorLog.is_active == True) & ((VisitorRequest.visitor_email == email) | (VisitorRequest.visitor_phone == phone))))
        return result.scalars().first()

    @staticmethod
    async def get_log_by_request_id(db: AsyncSession, request_id):
        result = await db.execute(select(VisitorLog).where(VisitorLog.visitor_request_id == request_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, visitor_log: VisitorLog):
        db.add(visitor_log)
        await db.commit()
        await db.refresh(visitor_log)
        return visitor_log

    @staticmethod
    async def update(db: AsyncSession, visitor_log: VisitorLog):
        await db.commit()
        await db.refresh(visitor_log)
        return visitor_log

    @staticmethod
    async def get_logs_paginated(db: AsyncSession, *, is_active: bool | None=None, search: str | None=None, page: int=1, limit: int=10):
        query = select(VisitorLog).join(VisitorLog.visitor_request).options(selectinload(VisitorLog.visitor_request).selectinload(VisitorRequest.host_employee))
        count_query = select(func.count(VisitorLog.id)).join(VisitorLog.visitor_request)
        if is_active is not None:
            query = query.where(VisitorLog.is_active == is_active)
            count_query = count_query.where(VisitorLog.is_active == is_active)
        if search:
            query = query.join(VisitorRequest.host_employee)
            count_query = count_query.join(VisitorRequest.host_employee)
            search_pattern = f'%{search}%'
            search_clause = VisitorRequest.visitor_name.ilike(search_pattern) | VisitorRequest.visitor_email.ilike(search_pattern) | VisitorRequest.visitor_phone.ilike(search_pattern) | VisitorRequest.company.ilike(search_pattern) | User.name.ilike(search_pattern)
            query = query.where(search_clause)
            count_query = count_query.where(search_clause)
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0
        query = query.order_by(VisitorLog.check_in_time.desc(), VisitorLog.created_at.desc())
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        items_result = await db.execute(query)
        items = items_result.scalars().all()
        return (total, items)