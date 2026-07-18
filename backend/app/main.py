from fastapi import FastAPI

app = FastAPI(
    title="Visitor Management System",
    version="1.0.0",
)

@app.get("/")
async def root():
    return {
        "message": "Visitor Management System API is Running 🚀"
    }

from app.api.v1.auth import router as auth_router
from app.api.v1.visitor_request import router as visitor_requests_router

app.include_router(auth_router,prefix="/api/v1",)
app.include_router(visitor_requests_router,prefix="/api/v1")