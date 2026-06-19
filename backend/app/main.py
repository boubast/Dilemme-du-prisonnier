import os
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.choix import RhaiScriptError
from app.routers.strategies import router as strategies_router
from app.routers.tournaments import router as tournaments_router

from sqlalchemy.exc import SQLAlchemyError, IntegrityError

load_dotenv()

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

@app.exception_handler(RhaiScriptError)
def rhai_script_error_handler(request, exc: RhaiScriptError):
    return JSONResponse(
        status_code=400,
        content={
            "detail": {
                "error_type": "rhai_script_error",
                "strategy_id": exc.strategy_id,
                "strategy_name": exc.strategy_name,
                "iteration": exc.iteration,
                "message": exc.message,
            }
        }
    )


@app.exception_handler(IntegrityError)
def integrity_error_handler(request, exc: IntegrityError):
    return JSONResponse(
        status_code=400,
        content={
            "detail": {
                "error_type": "database_integrity_error",
                "message": "Une contrainte d'intégrité de la base de données a été violée. Veuillez vérifier que les identifiants fournis (ex: stratégies) existent."
            }
        }
    )


@app.exception_handler(SQLAlchemyError)
def sqlalchemy_error_handler(request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={
            "detail": {
                "error_type": "database_error",
                "message": "Une erreur est survenue lors de l'accès à la base de données. Veuillez réessayer ultérieurement."
            }
        }
    )


@app.exception_handler(Exception)
def general_exception_handler(request, exc: Exception):
    import traceback
    print(f"Exception non gérée interceptée : {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "detail": {
                "error_type": "internal_server_error",
                "message": "Une erreur interne inattendue s'est produite sur le serveur."
            }
        }
    )


@app.get("/health")
def read_root():
    return {"status": "healthy"}
