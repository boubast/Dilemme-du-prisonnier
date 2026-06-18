from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.choix import MoteurChoix
from app.database import get_db
from app.models.strategie import Strategie
from app.schemas.strategie import (
    StrategieCreate,
    StrategieDetailRead,
    StrategieListRead,
    StrategieSyntaxValidationRead,
    StrategieSyntaxValidationRequest,
    StrategieUpdate,
)
from app.models.types.type_tournoi import Type_tournoi


router = APIRouter(prefix="/strategy", tags=["strategy"])


def validate_rhai_syntax(script: str) -> str | None:
    result = MoteurChoix().choix_classique(script, "[]", "[]", "1", "1", "1", "1")
    if result.startswith("Erreur:"):
        return result.removeprefix("Erreur:").strip()
    return None


@router.get("/{type_tournoi}", response_model=list[StrategieListRead])
def list_strategies(type_tournoi:Type_tournoi,db: Session = Depends(get_db)) -> list[Strategie]:
    return list(db.scalars(select(Strategie).where(Strategie.type_strategie==type_tournoi).order_by(Strategie.id_strategie)))


@router.post("/validate-syntax", response_model=StrategieSyntaxValidationRead)
def validate_strategie_syntax(payload: StrategieSyntaxValidationRequest) -> StrategieSyntaxValidationRead:
    error = validate_rhai_syntax(payload.script_rhai)
    return StrategieSyntaxValidationRead(valid=error is None, error=error)


@router.get("/{strategie_id}", response_model=StrategieDetailRead)
def get_strategie(strategie_id: int, db: Session = Depends(get_db)) -> Strategie:
    strategie = db.get(Strategie, strategie_id)
    if strategie is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategie introuvable")
    return strategie


@router.post("", response_model=StrategieDetailRead, status_code=status.HTTP_201_CREATED)
def create_strategie(payload: StrategieCreate, db: Session = Depends(get_db)) -> Strategie:
    syntax_error = validate_rhai_syntax(payload.script_rhai)
    if syntax_error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=syntax_error)

    strategie = Strategie(**payload.model_dump())
    db.add(strategie)
    db.commit()
    db.refresh(strategie)
    return strategie


@router.put("/{strategie_id}", response_model=StrategieDetailRead)
def update_strategie(strategie_id: int, payload: StrategieUpdate, db: Session = Depends(get_db)) -> Strategie:
    strategie = db.get(Strategie, strategie_id)
    if strategie is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategie introuvable")

    if payload.script_rhai is not None:
        syntax_error = validate_rhai_syntax(payload.script_rhai)
        if syntax_error:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=syntax_error)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(strategie, field, value)

    db.commit()
    db.refresh(strategie)
    return strategie


@router.delete("/{strategie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_strategie(strategie_id: int, db: Session = Depends(get_db)) -> Response:
    strategie = db.get(Strategie, strategie_id)
    if strategie is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategie introuvable")

    db.delete(strategie)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Impossible de supprimer cette stratégie car elle est utilisée par des données existantes.",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
