import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.strategies import router as strategies_router
from app.routers.tournaments import router as tournaments_router

FRONTEND_PORT = os.getenv("FRONTEND_PORT", "5173")
API_PREFIX = os.getenv("API_PREFIX", "/api/v1")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"http://localhost:{FRONTEND_PORT}",
        f"http://127.0.0.1:{FRONTEND_PORT}",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(strategies_router, prefix=API_PREFIX)
app.include_router(tournaments_router, prefix=API_PREFIX)


@app.get("/health")
def read_root():
    return {"status": "healthy"}
