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

app.include_router(
    auth_router,
    prefix="/api/v1",
)