from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.strategie import Strategie
from app.schemas.strategie import (
    StrategieCreate,
    StrategieDetailRead,
    StrategieListRead,
    StrategieUpdate,
)


router = APIRouter(prefix="/strategy", tags=["strategy"])


@router.get("", response_model=list[StrategieListRead])
def list_strategies(db: Session = Depends(get_db)) -> list[Strategie]:
    return list(db.scalars(select(Strategie).order_by(Strategie.id_strategie)))


@router.get("/{strategie_id}", response_model=StrategieDetailRead)
def get_strategie(strategie_id: int, db: Session = Depends(get_db)) -> Strategie:
    strategie = db.get(Strategie, strategie_id)
    if strategie is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategie introuvable")
    return strategie


@router.post("", response_model=StrategieDetailRead, status_code=status.HTTP_201_CREATED)
def create_strategie(payload: StrategieCreate, db: Session = Depends(get_db)) -> Strategie:
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
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
