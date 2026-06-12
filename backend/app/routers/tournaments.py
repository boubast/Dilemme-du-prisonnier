from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.tournoi import Tournoi
from app.models.partie import Partie
from app.models.participation import Participation
from app.schemas.tournoi import TournoiDetailRead, TournoiListRead

router = APIRouter(prefix="/tournament", tags=["tournament"])


@router.get("", response_model=list[TournoiListRead])
def list_tournaments(db: Session = Depends(get_db)) -> list[Tournoi]:
    return list(db.scalars(select(Tournoi).order_by(Tournoi.id_tournoi.desc())))


@router.get("/{tournoi_id}", response_model=TournoiDetailRead)
def get_tournament(tournoi_id: int, db: Session = Depends(get_db)) -> Tournoi:
    stmt = (
        select(Tournoi)
        .where(Tournoi.id_tournoi == tournoi_id)
        .options(
            selectinload(Tournoi.parties).selectinload(Partie.iterations),
            selectinload(Tournoi.parties).selectinload(Partie.strategie_1),
            selectinload(Tournoi.parties).selectinload(Partie.strategie_2),
            selectinload(Tournoi.participations).selectinload(Participation.strategie),
        )
    )
    tournoi = db.scalars(stmt).first()
    if tournoi is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournoi introuvable",
        )
    return tournoi
