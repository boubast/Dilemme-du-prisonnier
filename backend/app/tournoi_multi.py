import threading
from threading import Lock, Thread
from time import sleep
from app.choix import MoteurChoix
from app.models import Strategie
from app.database import SessionLocal

class Tournoi_multi:

    id_tournoi: int

    def __init__(self):
        self.stop = False
        self.mutex_lock = Lock()
        self.moteurChoix = MoteurChoix()

        self.actions = []
        self.actions_strats = []
        self.position = 0
        self.meilleure_strategie = ""
        self.date_creation = ""
        self.resultats = {}

        # Récupérer un tournoi de la BD
        #TODO Get tournoi depuis la BD
        self.strategie_ids = []
        self.duree = 0

    @staticmethod
    def create_tournoi(strategie_ids,duree):
        # Création du tournoi en BD
        #TODO Création tournoi en BD
        tournoi = Tournoi_multi()
        tournoi.strategie_ids = strategie_ids
        tournoi.duree = duree
        return tournoi

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
        sleep(self.duree)
        self.stop = True

    def generer_statistiques(self):
        db = SessionLocal()

        try:
            nb_cooperate_total = 0
            nb_betray_total = 0
            for i in range(len(self.strategie_ids)):
                id_strategie = self.strategie_ids[i]
                nb_cooperate = 0
                nb_betray = 0
                for pos_choix in self.actions_strats[i]:
                    if self.actions[pos_choix]=='1':
                        nb_betray += 1
                    else:
                        nb_cooperate += 1
                nb_cooperate_total += nb_cooperate
                nb_betray_total += nb_betray
                self.resultats[id_strategie] = {"nb_cooperate":nb_cooperate,"nb_betray":nb_betray,"score":0}

                #TODO enregistrer les résultats en BD
            
            valeur_cooperate = (2*nb_cooperate_total + nb_betray_total) / (nb_cooperate_total + 5*nb_betray_total)
            valeur_betray = 5*valeur_cooperate
            
            max_score = 0
            for id_strategie in self.strategie_ids:
                score = self.resultats[id_strategie]["nb_cooperate"] * valeur_cooperate + self.resultats[id_strategie]["nb_betray"] * valeur_betray
                self.resultats[id_strategie]["score"] = score

                if score>max_score:
                    self.meilleure_strategie = db.get(Strategie, id_strategie).nom
                    max_score = score
                elif score==max_score:
                    self.meilleure_strategie += " - " + db.get(Strategie, id_strategie).nom
                
                #TODO écriture en BD
            db.commit()
        finally:
            db.close()
