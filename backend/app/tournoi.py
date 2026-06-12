from app.partie import Partie

from app.models import Iteration, Strategie, Participation
from app.models import Tournoi as TournoiModel
from app.models import Partie as PartieModel
from app.database import SessionLocal

from sqlalchemy import select
from datetime import date

class Tournoi:
    id_tournoi: int
    date_creation = ""
    meilleure_strategie = ""
    resultats = {}
    scores_totaux = {}
    parties = []

    def __init__(self, nb_iterations,cout_coop_coop,cout_coop_trahi,cout_trahi_coop,cout_trahi_trahi,liste_strategies):
        self.nb_iterations = nb_iterations
        self.cout_coop_coop = cout_coop_coop
        self.cout_coop_trahi = cout_coop_trahi
        self.cout_trahi_coop = cout_trahi_coop
        self.cout_trahi_trahi = cout_trahi_trahi
        self.liste_strategies = liste_strategies

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
            self.id_tournoi = tournoi.id_tournoi

            # Création des participations (lien tournoi - stratégie) en BD
            for id_strategie in liste_strategies:
                participation = Participation(id_tournoi=self.id_tournoi,id_strategie=id_strategie)
                db.add(participation)
                db.commit()
                db.refresh(participation)
        finally:
            db.close()

    def generer_statistiques(self):
        db = SessionLocal()

        try:
            # Iitialisation des listes de statistiques tournoi
            strategies_tournoi = db.scalars(select(Participation)
                                    .where(Participation.id_tournoi == self.id_tournoi)).all()
            for strategie in strategies_tournoi:
                self.resultats[strategie.id_strategie] = {"V":0,"D":0,"N":0}
                self.scores_totaux[strategie.id_strategie] = 0
            
            # Parcourir les parties du tournoi
            parties_tournoi = db.scalars(select(PartieModel)
                                    .where(PartieModel.id_tournoi == self.id_tournoi)).all()
            for partie in parties_tournoi:
                iterations = db.scalars(select(Iteration)
                                        .where(Iteration.id_partie == partie.id_partie)).all()
                score_strategie_1 = 0
                score_strategie_2 = 0
                partie.resultats= {"V1":0,"V2":0,"N":0}
                
                # Parcourir les itérations de la partie
                for iteration in iterations:
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
                
                self.parties.append(partie)
            
            # Calcul et sauvegarde de la meilleure stratégie
            max_score = 0
            for strategie in strategies_tournoi:
                if self.scores_totaux[strategie.id_strategie] > max_score:
                    self.meilleure_strategie = db.get(Strategie, strategie.id_strategie).nom
                    max_score = self.scores_totaux[strategie.id_strategie]
                elif self.scores_totaux[strategie.id_strategie] == max_score:
                    self.meilleure_strategie += " - " + db.get(Strategie, strategie.id_strategie).nom
            
            tournoi = db.get(TournoiModel, self.id_tournoi)
            setattr(tournoi, "meilleure_strategie", self.meilleure_strategie)
            db.commit()
            db.refresh(tournoi)
        finally:
            db.close()
        return self

    def execute(self):
        for i in range(len(self.liste_strategies)):
            for j in range(i+1,len(self.liste_strategies)):
                    id_strategie1 = self.liste_strategies[i]
                    id_strategie2 = self.liste_strategies[j]

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
        
        # Lancement du calcul statistiques pour l'affichage immédiat + meilleure_strategie
        self.generer_statistiques()