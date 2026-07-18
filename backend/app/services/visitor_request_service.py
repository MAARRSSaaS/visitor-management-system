from fastapi import HTTPException

from app.models.visitor_request import VisitorRequest
from app.models.enums import VisitorRequestStatus

from app.repositories.visitor_request_repository import (
    VisitorRequestRepository
)



class VisitorRequestService:


    @staticmethod
    async def create_request(
        db,
        request,
        current_user
    ):

        visitor_request = VisitorRequest(

            visitor_name=request.visitor_name,

            visitor_email=request.visitor_email,

            visitor_phone=request.visitor_phone,

            company=request.company,

            purpose=request.purpose,

            visit_date=request.visit_date,

            remarks=request.remarks,

            host_employee_id=current_user.id

        )


        return await VisitorRequestRepository.create(
            db,
            visitor_request
        )



    @staticmethod
    async def my_requests(
        db,
        current_user
    ):

        return await VisitorRequestRepository.get_employee_requests(
            db,
            current_user.id
        )



    @staticmethod
    async def cancel_request(
        db,
        request_id,
        current_user
    ):

        visitor_request = await VisitorRequestRepository.get_by_id(
            db,
            request_id
        )


        if not visitor_request:
            raise HTTPException(
                404,
                "Visitor request not found"
            )


        if visitor_request.host_employee_id != current_user.id:
            raise HTTPException(
                403,
                "Not allowed"
            )


        if visitor_request.status != VisitorRequestStatus.PENDING:

            raise HTTPException(
                400,
                "Only pending requests can be cancelled"
            )


        visitor_request.status = VisitorRequestStatus.CANCELLED


        await db.commit()


        return visitor_request