from datetime import datetime, timezone
from fastapi import HTTPException
from app.models.visitor_request import VisitorRequest
from app.models.visitor_log import VisitorLog
from app.models.enums import VisitorRequestStatus
from app.repositories.visitor_request_repository import VisitorRequestRepository
from app.repositories.visitor_log_repository import VisitorLogRepository

class VisitorRequestService:

    @staticmethod
    async def create_request(db, request, current_user):
        status = VisitorRequestStatus.APPROVED if current_user.role == 'admin' else VisitorRequestStatus.PENDING
        host_employee_id = current_user.id
        if current_user.role == 'admin' and getattr(request, 'host_employee_id', None):
            host_employee_id = request.host_employee_id
        visitor_request = VisitorRequest(visitor_name=request.visitor_name, visitor_email=request.visitor_email, visitor_phone=request.visitor_phone, company=request.company, purpose=request.purpose, visit_date=request.visit_date, remarks=request.remarks, host_employee_id=host_employee_id, status=status)
        return await VisitorRequestRepository.create(db, visitor_request)

    @staticmethod
    async def my_requests(db, current_user):
        return await VisitorRequestRepository.get_employee_requests(db, current_user.id)

    @staticmethod
    async def get_requests(db, current_user, *, search: str | None=None, status=None, visit_date=None, page: int=1, limit: int=10):
        host_employee_id = None if current_user.role == 'admin' else current_user.id
        total, items = await VisitorRequestRepository.get_requests_paginated(db, host_employee_id=host_employee_id, search=search, status=status, visit_date=visit_date, page=page, limit=limit)
        return {'total': total, 'items': items, 'page': page, 'limit': limit}

    @staticmethod
    async def get_request_by_id(db, request_id, current_user):
        visitor_request = await VisitorRequestRepository.get_by_id(db, request_id)
        if not visitor_request:
            raise HTTPException(status_code=404, detail='Visitor request not found')
        if current_user.role != 'admin' and visitor_request.host_employee_id != current_user.id:
            raise HTTPException(status_code=403, detail='Not allowed to view this visitor request')
        return visitor_request

    @staticmethod
    async def update_request(db, request_id, request_data, current_user):
        visitor_request = await VisitorRequestRepository.get_by_id(db, request_id)
        if not visitor_request:
            raise HTTPException(status_code=404, detail='Visitor request not found')
        if current_user.role != 'admin':
            if visitor_request.host_employee_id != current_user.id:
                raise HTTPException(status_code=403, detail='Not allowed to update this request')
            if visitor_request.status != VisitorRequestStatus.PENDING:
                raise HTTPException(status_code=400, detail='Only pending requests can be modified')
        update_dict = request_data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(visitor_request, key, val)
        await db.commit()
        await db.refresh(visitor_request)
        return visitor_request

    @staticmethod
    async def cancel_request(db, request_id, current_user):
        visitor_request = await VisitorRequestRepository.get_by_id(db, request_id)
        if not visitor_request:
            raise HTTPException(status_code=404, detail='Visitor request not found')
        if visitor_request.host_employee_id != current_user.id:
            raise HTTPException(status_code=403, detail='Not allowed')
        if visitor_request.status != VisitorRequestStatus.PENDING:
            raise HTTPException(status_code=400, detail='Only pending requests can be cancelled')
        visitor_request.status = VisitorRequestStatus.CANCELLED
        await db.commit()
        await db.refresh(visitor_request)
        return visitor_request

    @staticmethod
    async def delete_request(db, request_id, current_user):
        visitor_request = await VisitorRequestRepository.get_by_id(db, request_id)
        if not visitor_request:
            raise HTTPException(status_code=404, detail='Visitor request not found')
        await VisitorRequestRepository.delete(db, visitor_request)
        return {'detail': 'Visitor request successfully deleted'}

    @staticmethod
    async def approve_request(db, request_id, current_user):
        visitor_request = await VisitorRequestRepository.get_by_id(db, request_id)
        if not visitor_request:
            raise HTTPException(status_code=404, detail='Visitor request not found')
        if visitor_request.status != VisitorRequestStatus.PENDING:
            raise HTTPException(status_code=400, detail='Only pending requests can be approved')
        visitor_request.status = VisitorRequestStatus.APPROVED
        await db.commit()
        await db.refresh(visitor_request)
        return visitor_request

    @staticmethod
    async def reject_request(db, request_id, current_user, remarks: str | None=None):
        visitor_request = await VisitorRequestRepository.get_by_id(db, request_id)
        if not visitor_request:
            raise HTTPException(status_code=404, detail='Visitor request not found')
        if visitor_request.status != VisitorRequestStatus.PENDING:
            raise HTTPException(status_code=400, detail='Only pending requests can be rejected')
        visitor_request.status = VisitorRequestStatus.REJECTED
        if remarks is not None:
            visitor_request.remarks = remarks
        await db.commit()
        await db.refresh(visitor_request)
        return visitor_request

    @staticmethod
    async def check_in(db, request_id, current_user):
        visitor_request = await VisitorRequestRepository.get_by_id(db, request_id)
        if not visitor_request:
            raise HTTPException(status_code=404, detail='Visitor request not found')
        if visitor_request.status != VisitorRequestStatus.APPROVED:
            raise HTTPException(status_code=400, detail='Only approved visitor requests can be checked in')
        active_log = await VisitorLogRepository.get_active_log_by_visitor(db=db, email=visitor_request.visitor_email, phone=visitor_request.visitor_phone)
        if active_log:
            raise HTTPException(status_code=400, detail='This visitor (by email or phone) is already checked in and has an active session.')
        visitor_log = await VisitorLogRepository.get_log_by_request_id(db, request_id)
        utc_now = datetime.now(timezone.utc)
        if visitor_log:
            if visitor_log.is_active:
                raise HTTPException(status_code=400, detail='This visitor request is already checked in (active).')
            visitor_log.check_in_time = utc_now
            visitor_log.check_out_time = None
            visitor_log.is_active = True
            await VisitorLogRepository.update(db, visitor_log)
        else:
            visitor_log = VisitorLog(visitor_request_id=request_id, check_in_time=utc_now, is_active=True)
            await VisitorLogRepository.create(db, visitor_log)
        await db.refresh(visitor_request)
        return visitor_request

    @staticmethod
    async def check_out(db, request_id, current_user):
        visitor_request = await VisitorRequestRepository.get_by_id(db, request_id)
        if not visitor_request:
            raise HTTPException(status_code=404, detail='Visitor request not found')
        visitor_log = await VisitorLogRepository.get_log_by_request_id(db, request_id)
        if not visitor_log or not visitor_log.is_active:
            raise HTTPException(status_code=400, detail='Visitor is not currently checked in')
        utc_now = datetime.now(timezone.utc)
        visitor_log.check_out_time = utc_now
        visitor_log.is_active = False
        await VisitorLogRepository.update(db, visitor_log)
        visitor_request.status = VisitorRequestStatus.COMPLETED
        await db.commit()
        await db.refresh(visitor_request)
        return visitor_request

    @staticmethod
    async def get_visitor_logs(db, current_user, *, is_active: bool | None=None, search: str | None=None, page: int=1, limit: int=10):
        total, items = await VisitorLogRepository.get_logs_paginated(db, is_active=is_active, search=search, page=page, limit=limit)
        return {'total': total, 'items': items, 'page': page, 'limit': limit}