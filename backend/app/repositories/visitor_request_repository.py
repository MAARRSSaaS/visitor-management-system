from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.visitor_request import VisitorRequest


class VisitorRequestRepository:


    @staticmethod
    async def create(
        db: AsyncSession,
        visitor_request: VisitorRequest
    ):

        db.add(visitor_request)

        await db.commit()

        await db.refresh(visitor_request)

        return visitor_request



    @staticmethod
    async def get_employee_requests(
        db: AsyncSession,
        employee_id
    ):

        result = await db.execute(

            select(VisitorRequest)
            .where(
                VisitorRequest.host_employee_id == employee_id
            )

        )

        return result.scalars().all()



    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        request_id
    ):

        result = await db.execute(

            select(VisitorRequest)
            .where(
                VisitorRequest.id == request_id
            )

        )

        return result.scalar_one_or_none()



    @staticmethod
    async def delete(
        db,
        visitor_request
    ):

        await db.delete(visitor_request)

        await db.commit()