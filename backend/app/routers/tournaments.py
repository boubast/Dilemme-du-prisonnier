from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tournoi import Tournoi
from app.schemas.tournament import TournamentLaunchCreate


router = APIRouter(prefix="/tournament", tags=["tournament"])


@router.post("/launch", status_code=status.HTTP_201_CREATED)
def launch_tournament(payload: TournamentLaunchCreate, db: Session = Depends(get_db)) -> dict[str, int | str]:
    tournament = Tournoi(
        nb_iterations=payload.nb_iterations,
        cout_coop_coop=payload.cout_coop_coop,
        cout_coop_trahi=payload.cout_coop_trahi,
        cout_trahi_coop=payload.cout_trahi_coop,
        cout_trahi_trahi=payload.cout_trahi_trahi,
        date_creation=date.today(),
    )

    db.add(tournament)
    db.commit()
    db.refresh(tournament)

    # TODO: executer le tournoi entre les strategies selectionnees.
    return {
        "id_tournoi": tournament.id_tournoi,
        "nom_tournoi": f"Tournoi - {len(payload.strategie_ids)} strategies",
    }
