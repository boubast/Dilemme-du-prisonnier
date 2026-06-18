from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.participation import Participation
from app.models.partie import Partie
from app.models.tournament import Tournament
from app.models.tournament_classic import TournamentClassic
from app.models.tournament_multi import TournamentMulti
from app.schemas.tournament import TournamentLaunchCreate,TournamentMultiLaunchCreate, TournamentDetailRead, TournamentListRead
from app.tournoi import Tournoi as TournoiMoteur
from app.tournoi_multi import Tournoi_multi as TournoiMultiMoteur
from app.database import SessionLocal
from app.models.types.type_tournoi import Type_tournoi

router = APIRouter(prefix="/tournament", tags=["tournament"])

lastTournamentStatistics = None

@router.get("", response_model=list[TournamentListRead])
def list_tournaments(db: Session = Depends(get_db)) -> list[Tournament]:
    return list(db.scalars(select(Tournament).order_by(Tournament.id_tournoi.desc())))


@router.get("/{type_tournoi}/{tournoi_id}", response_model=TournamentDetailRead)
def get_tournament(type_tournoi:Type_tournoi, tournoi_id: int, db: Session = Depends(get_db)) -> TournamentClassic:

    global lastTournamentStatistics

    if lastTournamentStatistics is None or lastTournamentStatistics.id_tournoi != tournoi_id :

        stmt = (
            select(TournamentClassic)
            .where(TournamentClassic.id_tournoi == tournoi_id)
            .options(
                selectinload(TournamentClassic.parties).selectinload(Partie.iterations),
                selectinload(TournamentClassic.parties).selectinload(Partie.strategie_1),
                selectinload(TournamentClassic.parties).selectinload(Partie.strategie_2),
                selectinload(TournamentClassic.participations).selectinload(Participation.strategie),
            )
        )
        tournoi = db.scalars(stmt).first()

        if tournoi is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tournoi introuvable",
            )
        tournoiStats = TournoiMoteur(tournoi.id_tournoi)
        tournoiStats.generer_statistiques()
        return tournoiStats

    else :
        return lastTournamentStatistics


@router.post(
    "/launch",
    response_model=TournamentDetailRead,
    status_code=status.HTTP_201_CREATED,
)
async def launch_tournament(payload: TournamentLaunchCreate) -> TournoiMoteur:

    global lastTournamentStatistics

    tournoi = TournoiMoteur.create_tournoi(payload.nb_iterations,
                            payload.cout_coop_coop,
                            payload.cout_coop_trahi,
                            payload.cout_trahi_coop,
                            payload.cout_trahi_trahi,
                            payload.strategie_ids)

    try:
        response = await tournoi.execute_async()
    except Exception as e:
        db = SessionLocal()
        try:
            # Suppression du tournoi en cas d'erreur lors de l'exécution
            tournoi_db = db.get(Tournament, tournoi.id_tournoi)
            if tournoi_db:
                db.delete(tournoi_db)
                db.commit()
        finally:
            db.close()
        raise e

    response.generer_statistiques()
    lastTournamentStatistics = response

    return response

@router.post(
    "/launch_multi",
    response_model=TournamentDetailRead,
    status_code=status.HTTP_201_CREATED,
)
async def launch_tournament(payload: TournamentMultiLaunchCreate) -> TournoiMultiMoteur:

    global lastTournamentStatistics

    tournoi = TournoiMultiMoteur.create_tournoi(payload.duree_secondes,
                            payload.strategie_ids)

    try:
        response = tournoi.execute()
    except Exception as e:
        db = SessionLocal()
        try:
            # Suppression du tournoi en cas d'erreur lors de l'exécution
            tournoi_db = db.get(Tournament, tournoi.id_tournoi)
            if tournoi_db:
                db.delete(tournoi_db)
                db.commit()
        finally:
            db.close()
        raise e

    response.generer_statistiques()
    lastTournamentStatistics = response

    return response