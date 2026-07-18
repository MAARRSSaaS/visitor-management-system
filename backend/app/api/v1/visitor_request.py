from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db

from app.core.security import get_current_user

from app.schemas.visitor_request import (
    VisitorRequestCreate,
    VisitorRequestResponse
)

from app.services.visitor_request_service import (
    VisitorRequestService
)



router = APIRouter(prefix="/visitor-requests",tags=["Visitor Requests"])



@router.post(
    "",
    response_model=VisitorRequestResponse
)
async def create_request(

    request: VisitorRequestCreate,

    db: AsyncSession = Depends(get_db),

    current_user = Depends(get_current_user)

):

    return await VisitorRequestService.create_request(
        db,
        request,
        current_user
    )




@router.get(
    "/my",
    response_model=list[VisitorRequestResponse]
)
async def my_requests(

    db: AsyncSession = Depends(get_db),

    current_user = Depends(get_current_user)

):

    return await VisitorRequestService.my_requests(
        db,
        current_user
    )