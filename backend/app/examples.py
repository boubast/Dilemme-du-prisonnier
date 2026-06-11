from datetime import date

from sqlalchemy.orm import Session

from app.models import Iteration, Partie, Strategie, Tournoi
from app.database import SessionLocal

db = SessionLocal()

def creer_tournoi_avec_partie_et_iterations(db: Session) -> Tournoi:
    strategie_1 = db.get(Strategie, 1)
    strategie_2 = db.get(Strategie, 2)

    if strategie_1 is None or strategie_2 is None:
        raise ValueError("Les strategies 1 et 2 doivent exister en base")

    tournoi = Tournoi(
        nb_iterations=3,
        cout_coop_coop=2,
        cout_coop_trahi=0,
        cout_trahi_coop=3,
        cout_trahi_trahi=1,
        date_creation=date.today(),
    )

    partie = Partie(
        tournoi=tournoi,
        strategie_1=strategie_1,
        strategie_2=strategie_2,
    )

    partie.iterations = [
        Iteration(numero_iteration=1, choix_strategie_1=True, choix_strategie_2=True),
        Iteration(numero_iteration=2, choix_strategie_1=True, choix_strategie_2=False),
        Iteration(numero_iteration=3, choix_strategie_1=False, choix_strategie_2=False),
    ]

    db.add(tournoi)
    db.commit()
    db.refresh(tournoi)

    return tournoi


def ajouter_partie_a_un_tournoi_existant(
    db: Session,
    tournoi_id: int,
    strategie_1_id: int,
    strategie_2_id: int,
) -> Partie:
    tournoi = db.get(Tournoi, tournoi_id)
    strategie_1 = db.get(Strategie, strategie_1_id)
    strategie_2 = db.get(Strategie, strategie_2_id)

    if tournoi is None:
        raise ValueError("Tournoi introuvable")
    if strategie_1 is None or strategie_2 is None:
        raise ValueError("Strategie introuvable")

    partie = Partie(
        tournoi=tournoi,
        strategie_1=strategie_1,
        strategie_2=strategie_2,
    )

    db.add(partie)
    db.commit()
    db.refresh(partie)

    return partie


def ajouter_iteration_a_une_partie(
    db: Session,
    partie_id: int,
    numero_iteration: int,
    choix_strategie_1: bool,
    choix_strategie_2: bool,
) -> Iteration:
    partie = db.get(Partie, partie_id)

    if partie is None:
        raise ValueError("Partie introuvable")

    iteration = Iteration(
        partie=partie,
        numero_iteration=numero_iteration,
        choix_strategie_1=choix_strategie_1,
        choix_strategie_2=choix_strategie_2,
    )

    db.add(iteration)
    db.commit()
    db.refresh(iteration)

    return iteration
