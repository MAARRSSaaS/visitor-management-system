from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
app = FastAPI(title='Visitor Management System', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = ' -> '.join((str(loc) for loc in error['loc']))
        errors.append({'field': field, 'message': error['msg']})
    return JSONResponse(status_code=422, content={'detail': errors})

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={'detail': exc.detail})

@app.get('/')
async def root():
    return {'message': 'Visitor Management System API is Running 🚀'}
from app.api.v1.auth import router as auth_router
from app.api.v1.visitor_request import router as visitor_requests_router
from app.api.v1.visitor_log import router as visitor_log_router
from app.api.v1.users import router as users_router
app.include_router(auth_router, prefix='/api/v1')
app.include_router(visitor_requests_router, prefix='/api/v1')
app.include_router(visitor_log_router, prefix='/api/v1')
app.include_router(users_router, prefix='/api/v1')