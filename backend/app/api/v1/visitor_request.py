from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database.database import get_db
from app.core.security import get_current_user
from app.core.dependencies import admin_required
from app.models.enums import VisitorRequestStatus
from app.schemas.visitor_request import VisitorRequestCreate, VisitorRequestUpdate, VisitorRequestResponse, PaginatedVisitorRequests
from app.services.visitor_request_service import VisitorRequestService
router = APIRouter(prefix='/visitor-requests', tags=['Visitor Requests'])

class RejectRequestPayload(BaseModel):
    remarks: str | None = None

@router.post('', response_model=VisitorRequestResponse)
async def create_request(request: VisitorRequestCreate, db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    return await VisitorRequestService.create_request(db, request, current_user)

@router.get('', response_model=PaginatedVisitorRequests)
async def list_requests(search: str | None=Query(None, description='Search by visitor name, email, phone, company, or purpose'), status: VisitorRequestStatus | None=Query(None, description='Filter by request status'), visit_date: date | None=Query(None, description='Filter by visit date'), page: int=Query(1, ge=1, description='Page number'), limit: int=Query(10, ge=1, le=100, description='Items per page'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    return await VisitorRequestService.get_requests(db, current_user, search=search, status=status, visit_date=visit_date, page=page, limit=limit)

@router.get('/my', response_model=list[VisitorRequestResponse])
async def my_requests(db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    return await VisitorRequestService.my_requests(db, current_user)

@router.get('/{id}', response_model=VisitorRequestResponse)
async def get_request_by_id(id: UUID=Path(..., description='Visitor Request ID'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    return await VisitorRequestService.get_request_by_id(db, id, current_user)

@router.put('/{id}', response_model=VisitorRequestResponse)
async def update_request(request: VisitorRequestUpdate, id: UUID=Path(..., description='Visitor Request ID'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    return await VisitorRequestService.update_request(db, id, request, current_user)

@router.delete('/{id}')
async def delete_request(id: UUID=Path(..., description='Visitor Request ID'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    admin_required(current_user)
    return await VisitorRequestService.delete_request(db, id, current_user)

@router.post('/{id}/cancel', response_model=VisitorRequestResponse)
async def cancel_request(id: UUID=Path(..., description='Visitor Request ID'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    return await VisitorRequestService.cancel_request(db, id, current_user)

@router.post('/{id}/approve', response_model=VisitorRequestResponse)
async def approve_request(id: UUID=Path(..., description='Visitor Request ID'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    admin_required(current_user)
    return await VisitorRequestService.approve_request(db, id, current_user)

@router.post('/{id}/reject', response_model=VisitorRequestResponse)
async def reject_request(payload: RejectRequestPayload, id: UUID=Path(..., description='Visitor Request ID'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    admin_required(current_user)
    return await VisitorRequestService.reject_request(db, id, current_user, remarks=payload.remarks)

@router.post('/{id}/check-in', response_model=VisitorRequestResponse)
async def check_in(id: UUID=Path(..., description='Visitor Request ID'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    admin_required(current_user)
    return await VisitorRequestService.check_in(db, id, current_user)

@router.post('/{id}/check-out', response_model=VisitorRequestResponse)
async def check_out(id: UUID=Path(..., description='Visitor Request ID'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    admin_required(current_user)
    return await VisitorRequestService.check_out(db, id, current_user)