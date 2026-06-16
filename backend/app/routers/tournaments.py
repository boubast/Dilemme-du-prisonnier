from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.participation import Participation
from app.models.partie import Partie
from app.models.tournoi import Tournoi
from app.schemas.tournoi import TournamentLaunchCreate, TournoiDetailRead, TournoiListRead

from app.tournoi import Tournoi as TournoiMoteur

router = APIRouter(prefix="/tournament", tags=["tournament"])

lastTournamentStatistics = None

@router.get("", response_model=list[TournoiListRead])
def list_tournaments(db: Session = Depends(get_db)) -> list[Tournoi]:
    return list(db.scalars(select(Tournoi).order_by(Tournoi.id_tournoi.desc())))


@router.get("/{tournoi_id}", response_model=TournoiDetailRead)
def get_tournament(tournoi_id: int, db: Session = Depends(get_db)) -> Tournoi:

    global lastTournamentStatistics

    if lastTournamentStatistics is None or lastTournamentStatistics.id_tournoi != tournoi_id :

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
        tournoiStats = TournoiMoteur(tournoi.id_tournoi)
        tournoiStats.generer_statistiques()

        if tournoi is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournoi introuvable",
            )
        return tournoiStats

    else :
        return lastTournamentStatistics


@router.post("/launch", status_code=status.HTTP_201_CREATED)
def launch_tournament(payload: TournamentLaunchCreate, db: Session = Depends(get_db)) -> dict[str, int | str]:

    global lastTournamentStatistics

    tournoi = TournoiMoteur.create_tournoi(payload.nb_iterations,
                            payload.cout_coop_coop,
                            payload.cout_coop_trahi,
                            payload.cout_trahi_coop,
                            payload.cout_trahi_trahi,
                            payload.strategie_ids)
    tournoi.execute()

    tournoi.generer_statistiques()
    lastTournamentStatistics = tournoi

    return {
        "id_tournoi": tournoi.id_tournoi,
        "nom_tournoi": f"Tournoi - {len(payload.strategie_ids)} strategies",
    }
