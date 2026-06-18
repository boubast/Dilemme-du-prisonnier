import threading
from threading import Lock, Thread
from time import sleep
from app.choix import MoteurChoix
from app.models import Strategie
from app.database import SessionLocal
from app.ITournoi import ITournoi
from app.models import Tournament as TournoiModel
from app.models import TournamentMulti as TournoiMultiModel
from app.models import Strategie, ParticipationMulti
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import selectinload

class Tournoi_multi(ITournoi):

    def __init__(self,id_tournoi):
        super().__init__()

        self.stop = False
        self.mutex_lock = Lock()
        self.moteurChoix = MoteurChoix()

        self.actions = []
        self.actions_strats = []
        self.position = 0
        self.meilleure_strategie = ""
        self.date_creation = ""
        self.resultats = {}
        self.participations_multi = []
        self.strategie_ids = []
        self.type_tournoi = "Multi"

        # Récupérer un tournoi de la BD
        db = SessionLocal()
        try:
            stmt = (
                select(TournoiModel)
                .where(TournoiModel.id_tournoi == id_tournoi)
            )
            tournoiBD = db.scalars(stmt).first()
            if tournoiBD is None:
                raise ValueError("Tournoi introuvable")
            
            stmt = (
                select(TournoiMultiModel)
                .where(TournoiMultiModel.id_tournoi == id_tournoi)
                .options(
                    selectinload(TournoiMultiModel.participations).selectinload(ParticipationMulti.strategie),
                )
            )
            tournoiMultiBD = db.scalars(stmt).first()
            if tournoiMultiBD is None:
                raise ValueError("Tournoi introuvable")

            self.participations = tournoiMultiBD.participations

            self.duree_secondes = tournoiMultiBD.duree_secondes
            self.strategie_ids = [participation.id_strategie 
                                  for participation in self.participations]
            self.date_creation = tournoiBD.date_creation
            self.id_tournoi = tournoiBD.id_tournoi

        finally:
            db.close()

    @staticmethod
    def create_tournoi(duree_secondes,strategie_ids):
        # Création du tournoi en BD
        tournoi = TournoiModel(date_creation=date.today(),
                               type_tournoi="Multi")
        
        db = SessionLocal()
        try:
            db.add(tournoi)
            db.commit()
            db.refresh(tournoi)

            tournoi_multi = TournoiMultiModel(id_tournoi=tournoi.id_tournoi,
                               duree_secondes=duree_secondes)
            db.add(tournoi_multi)

            # Création des participations (lien tournoi - stratégie) en BD
            for id_strategie in strategie_ids:
                participation = ParticipationMulti(id_tournoi=tournoi.id_tournoi,
                                                   id_strategie=id_strategie,
                                                   nombre_cooperations=0,
                                                   nombre_trahisons=0)
                db.add(participation)
            db.commit()

            return Tournoi_multi(tournoi.id_tournoi)
        finally:
            db.close()

    def execute(self):
        self.actions_strats = [[] for i in range(len(self.strategie_ids))]
        for i in range(len(self.strategie_ids)):

            # Lancement de chacune des stratégies
            thread = threading.Thread(target=self.iterer_strategie,args=(i,self.strategie_ids[i],))
            thread.start()
        
        # Lancement du compteur de temps
        attente = threading.Thread(target=self.stopper)
        attente.start()
        attente.join()

        return self

    def iterer_strategie(self,numero_strat,id_strategie):
        db = SessionLocal()
        try:
            strategie = db.get(Strategie, id_strategie)
            script = strategie.script_rhai

            while not(self.stop): # Boucler tant que le temps n'est pas terminé
                choice = self.moteurChoix.choix_multi(str(script),str(self.actions),str(self.actions_strats),str(numero_strat))

                self.mutex_lock.acquire()
                # Mise à jour de la liste des actions
                self.actions.append(choice)
                # Ajout de la position à la liste des positions des actions de la stratégie
                self.actions_strats[numero_strat].append(self.position)
                self.position+=1
                self.mutex_lock.release()
        finally:
            db.close()

    def stopper(self):
        self.stop = False
        sleep(self.duree_secondes)
        self.stop = True

    def generer_statistiques(self):
        db = SessionLocal()

        try:
            nb_cooperate_total = 0
            nb_betray_total = 0
            # Parcourir les stratégies du tournoi
            for i in range(len(self.strategie_ids)):
                id_strategie = self.strategie_ids[i]
                nb_cooperate = 0
                nb_betray = 0
                # Parcourir les choix de la stratégie
                for pos_choix in self.actions_strats[i]:
                    if self.actions[pos_choix]=='1':
                        nb_betray += 1
                    else:
                        nb_cooperate += 1
                nb_cooperate_total += nb_cooperate
                nb_betray_total += nb_betray
                self.resultats[id_strategie] = {"nb_cooperate":nb_cooperate,"nb_betray":nb_betray,"score":0}
            
            # Calcul des valeurs de chaque action
            valeur_cooperate = (2*nb_cooperate_total + nb_betray_total) / (nb_cooperate_total + 5*nb_betray_total)
            valeur_betray = 5*valeur_cooperate
            
            # Calcul et sauvegarde de la meilleure stratégie
            max_score = 0
            for id_strategie in self.strategie_ids:
                score = self.resultats[id_strategie]["nb_cooperate"] * valeur_cooperate + self.resultats[id_strategie]["nb_betray"] * valeur_betray
                self.resultats[id_strategie]["score"] = score

                if score>max_score:
                    self.meilleure_strategie = db.get(Strategie, id_strategie).nom
                    max_score = score
                elif score==max_score:
                    self.meilleure_strategie += " - " + db.get(Strategie, id_strategie).nom
                
            tournoi = db.get(TournoiModel, self.id_tournoi)
            setattr(tournoi, "meilleure_strategie", self.meilleure_strategie)
            tournoi_multi = db.get(TournoiMultiModel, self.id_tournoi)
            setattr(tournoi_multi, "resultats", self.resultats)
            db.commit()
            db.refresh(tournoi)
            db.commit()
        finally:
            db.close()
