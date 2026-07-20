from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.core.security import get_current_user
from app.core.dependencies import admin_required
from app.schemas.visitor_log import PaginatedVisitorLogs
from app.services.visitor_request_service import VisitorRequestService
router = APIRouter(prefix='/visitor-logs', tags=['Visitor Logs'])

@router.get('', response_model=PaginatedVisitorLogs)
async def list_visitor_logs(is_active: bool | None=Query(None, description='Filter by currently active/checked-in status'), search: str | None=Query(None, description='Search by visitor name, email, phone, company, or host employee name'), page: int=Query(1, ge=1, description='Page number'), limit: int=Query(10, ge=1, le=100, description='Items per page'), db: AsyncSession=Depends(get_db), current_user=Depends(get_current_user)):
    admin_required(current_user)
    return await VisitorRequestService.get_visitor_logs(db, current_user, is_active=is_active, search=search, page=page, limit=limit)