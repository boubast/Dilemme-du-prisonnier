class ITournoi:

    id_tournoi: int

    def __init__(self):
        self.type_tournoi = None
        self.date_creation = None
        self.meilleure_strategie = None

        self.cout_coop_coop = None
        self.cout_coop_trahi = None
        self.cout_trahi_coop = None
        self.cout_trahi_trahi = None
        self.resultats = None
        self.scores_totaux = None
        self.parties = None
        self.participations = None
        self.nb_iterations = None

        self.duree_secondes = None
        self.participations_multi = None
