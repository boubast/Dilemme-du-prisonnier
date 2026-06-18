from app.choix import MoteurChoix, RhaiScriptError
from sqlalchemy.orm import Session

from app.models import Iteration, Strategie
from app.models import Partie as PartieModel
from app.database import SessionLocal

class Partie:
    id_partie: int
    score_strategie_1 = 0
    score_strategie_2 = 0
    resultats = {}

    def __init__(self,id_strategie_1,id_strategie_2,id_tournoi):
        self.id_strategie_1 = id_strategie_1
        self.id_strategie_2 = id_strategie_2
        self.id_tournoi = id_tournoi

        # Création de la partie en BD
        partie = PartieModel(id_strategie_1=id_strategie_1,id_strategie_2=id_strategie_2,id_tournoi=id_tournoi)
        db = SessionLocal()
        try:
            db.add(partie)
            db.commit()
            db.refresh(partie)
            self.id_partie = partie.id_partie
        finally:
            db.close()

    def execute(self,nb_iterations,cout_coop_coop,cout_coop_trahi,cout_trahi_coop,cout_trahi_trahi):
        cout_trahi_trahi = str(cout_trahi_trahi)
        cout_coop_coop = str(cout_coop_coop)
        cout_trahi_coop = str(cout_trahi_coop)
        cout_coop_trahi = str(cout_coop_trahi)
        
        db = SessionLocal()

        try:
            # Récupérer les scripts des stratégies
            strategie_1 = db.get(Strategie, self.id_strategie_1)
            strategie_2 = db.get(Strategie, self.id_strategie_2)
            script1 = strategie_1.script_rhai
            script2 = strategie_2.script_rhai
            
            actions_strat1_str = "["
            actions_strat2_str = "["
            choix_strat1 = ""
            choix_strat2 = ""

            moteurChoix = MoteurChoix() #Exécuteur de code Rhai, en Singleton
            
            for no_iteration in range(nb_iterations):
                choix_strat1 = moteurChoix.choix(script1,actions_strat1_str + "]",actions_strat2_str + "]",
                                            cout_trahi_trahi,
                                            cout_coop_coop,
                                            cout_trahi_coop,
                                            cout_coop_trahi)
                if choix_strat1.startswith(("Error:", "Erreur:")):
                    error_msg = choix_strat1.split(":", 1)[1].strip()
                    raise RhaiScriptError(self.id_strategie_1, strategie_1.nom, no_iteration + 1, error_msg)

                choix_strat2 = moteurChoix.choix(script2,actions_strat2_str + "]",actions_strat1_str + "]",
                                            cout_trahi_trahi,
                                            cout_coop_coop,
                                            cout_trahi_coop,
                                            cout_coop_trahi)
                if choix_strat2.startswith(("Error:", "Erreur:")):
                    error_msg = choix_strat2.split(":", 1)[1].strip()
                    raise RhaiScriptError(self.id_strategie_2, strategie_2.nom, no_iteration + 1, error_msg)
                
                # Création de l'itération en BD
                iteration = Iteration(id_partie=self.id_partie,
                                      numero_iteration=no_iteration+1,
                                      choix_strategie_1=int(choix_strat1),
                                      choix_strategie_2=int(choix_strat2))
                db.add(iteration)

                if no_iteration==0: #On en met pas de virgule avant le premier élément des listes
                    actions_strat1_str = actions_strat1_str + choix_strat1
                    actions_strat2_str = actions_strat2_str + choix_strat2
                else:
                    actions_strat1_str = actions_strat1_str + "," + choix_strat1
                    actions_strat2_str = actions_strat2_str + "," + choix_strat2
            
            db.commit()
        finally:
            db.close()
