from app.partie import Partie

from app.models import Iteration, Strategie, Participation
from app.models import Tournoi as TournoiModel
from app.models import Partie as PartieModel
from app.database import SessionLocal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from datetime import date

class Tournoi:
    id_tournoi: int
    date_creation = ""
    meilleure_strategie = ""
    resultats = {}
    scores_totaux = {}
    parties = []
    participations = []

    def __init__(self,id_tournoi):

        # Récupérer un tournoi de la BD
        db = SessionLocal()
        try:
            stmt = (
                select(TournoiModel)
                .where(TournoiModel.id_tournoi == id_tournoi)
                .options(
                    selectinload(TournoiModel.parties).selectinload(PartieModel.iterations),
                    selectinload(TournoiModel.parties).selectinload(PartieModel.strategie_1),
                    selectinload(TournoiModel.parties).selectinload(PartieModel.strategie_2),
                    selectinload(TournoiModel.participations).selectinload(Participation.strategie),
                )
            )
            tournoiBD = db.scalars(stmt).first()

            self.participations = tournoiBD.participations
            self.parties = tournoiBD.parties

            self.nb_iterations = tournoiBD.nb_iterations
            self.cout_coop_coop = tournoiBD.cout_coop_coop
            self.cout_coop_trahi = tournoiBD.cout_coop_trahi
            self.cout_trahi_coop = tournoiBD.cout_trahi_coop
            self.cout_trahi_trahi = tournoiBD.cout_trahi_trahi
            self.strategie_ids = [participation.id_strategie 
                                  for participation in self.participations]
            self.date_creation = tournoiBD.date_creation
            self.id_tournoi = tournoiBD.id_tournoi

        finally:
            db.close()

    @staticmethod
    def create_tournoi(nb_iterations,cout_coop_coop,cout_coop_trahi,cout_trahi_coop,cout_trahi_trahi,strategie_ids):
        # Création du tournoi en BD
        tournoi = TournoiModel(nb_iterations=nb_iterations,
                               cout_coop_coop=cout_coop_coop,
                               cout_coop_trahi=cout_coop_trahi,
                               cout_trahi_coop=cout_trahi_coop,
                               cout_trahi_trahi=cout_trahi_trahi,
                               date_creation=date.today())
        db = SessionLocal()
        try:
            db.add(tournoi)
            db.commit()
            db.refresh(tournoi)

            # Création des participations (lien tournoi - stratégie) en BD
            for id_strategie in strategie_ids:
                participation = Participation(id_tournoi=tournoi.id_tournoi,id_strategie=id_strategie)
                db.add(participation)
                db.commit()
                db.refresh(participation)

            return Tournoi(tournoi.id_tournoi)
        finally:
            db.close()
    
    def generer_statistiques(self):
        db = SessionLocal()

        try:
            # Initialisation des listes de statistiques tournoi
            for strategie in self.participations:
                self.resultats[strategie.id_strategie] = {"V":0,"D":0,"N":0}
                self.scores_totaux[strategie.id_strategie] = 0
            
            # Parcourir les parties du tournoi
            for partie in self.parties:
                score_strategie_1 = 0
                score_strategie_2 = 0
                partie.resultats= {"V1":0,"V2":0,"N":0}
                
                # Parcourir les itérations de la partie
                for iteration in partie.iterations:
                    # Chargement des scores et des Victoire 1 / Victoire 2 / Nul
                    match iteration.choix_strategie_1:
                        case 0:
                            match iteration.choix_strategie_2:
                                case 0:
                                    score_strategie_1 = score_strategie_1 + self.cout_coop_coop
                                    score_strategie_2 = score_strategie_2 + self.cout_coop_coop
                                    partie.resultats["N"] += 1
                                case 1:
                                    score_strategie_1 = score_strategie_1 + self.cout_coop_trahi
                                    score_strategie_2 = score_strategie_2 + self.cout_trahi_coop
                                    partie.resultats["V2"] += 1
                        case 1:
                            match iteration.choix_strategie_2:
                                case 0:
                                    score_strategie_1 = score_strategie_1 + self.cout_trahi_coop
                                    score_strategie_2 = score_strategie_2 + self.cout_coop_trahi
                                    partie.resultats["V1"] += 1
                                case 1:
                                    score_strategie_1 = score_strategie_1 + self.cout_trahi_trahi
                                    score_strategie_2 = score_strategie_2 + self.cout_trahi_trahi
                                    partie.resultats["N"] += 1
                # Sauvegarde des statistiques Partie
                partie.score_strategie_1 = score_strategie_1
                partie.score_strategie_2 = score_strategie_2

                # Sauvegarde des statistiques Tournoi
                self.scores_totaux[partie.id_strategie_1] += score_strategie_1
                self.scores_totaux[partie.id_strategie_2] += score_strategie_2
                
                if score_strategie_1 == score_strategie_2:
                    self.resultats[partie.id_strategie_1]["N"]+=1
                    self.resultats[partie.id_strategie_2]["N"]+=1
                elif score_strategie_1 > score_strategie_2:
                    self.resultats[partie.id_strategie_1]["V"]+=1
                    self.resultats[partie.id_strategie_2]["D"]+=1
                elif score_strategie_1 < score_strategie_2:
                    self.resultats[partie.id_strategie_1]["D"]+=1
                    self.resultats[partie.id_strategie_2]["V"]+=1
                
                #self.parties.append(partie)
            
            # Calcul et sauvegarde de la meilleure stratégie
            max_score = 0
            for participation in self.participations:
                if self.scores_totaux[participation.id_strategie] > max_score:
                    self.meilleure_strategie = db.get(Strategie, participation.id_strategie).nom
                    max_score = self.scores_totaux[participation.id_strategie]
                elif self.scores_totaux[participation.id_strategie] == max_score:
                    self.meilleure_strategie += " - " + db.get(Strategie, participation.id_strategie).nom
            
            tournoi = db.get(TournoiModel, self.id_tournoi)
            setattr(tournoi, "meilleure_strategie", self.meilleure_strategie)
            db.commit()
            db.refresh(tournoi)
        finally:
            db.close()

    def execute(self):
        for i in range(len(self.strategie_ids)):
            for j in range(i+1,len(self.strategie_ids)):
                    id_strategie1 = self.strategie_ids[i]
                    id_strategie2 = self.strategie_ids[j]

                    # Création de la partie à exécuter
                    partie_courante = Partie(
                        id_strategie1,
                        id_strategie2,
                        self.id_tournoi)
                    
                    partie_courante.execute(self.nb_iterations,
                        self.cout_trahi_trahi,
                        self.cout_coop_coop,
                        self.cout_trahi_coop,
                        self.cout_coop_trahi)
        
        db = SessionLocal()
        try:
            stmt = (
                select(TournoiModel)
                .where(TournoiModel.id_tournoi == self.id_tournoi)
                .options(
                    selectinload(TournoiModel.parties).selectinload(PartieModel.iterations),
                    selectinload(TournoiModel.parties).selectinload(PartieModel.strategie_1),
                    selectinload(TournoiModel.parties).selectinload(PartieModel.strategie_2),
                    selectinload(TournoiModel.participations).selectinload(Participation.strategie),
                )
            )
            tournoiBD = db.scalars(stmt).first()

            self.participations = tournoiBD.participations
            self.parties = tournoiBD.parties
        finally:
            db.close()