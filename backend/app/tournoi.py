from partie import partie

def tournoi(
        nb_iterations,
        cout_trahison,
        cout_cooperation,
        cout_trahison_cooperation,
        cout_cooperation_trahison,
        liste_strategies):
    #TODO : Create Tournoi
    #TODO : Create ParticipationS

    for i in range(len(liste_strategies)):
        for j in range(i+1,len(liste_strategies)):
                id_strategie1 = liste_strategies[i]
                id_strategie2 = liste_strategies[j]

                #TODO : Create Partie

                #TODO : A supprimer
                print(partie(nb_iterations,
                       cout_trahison,
                       cout_cooperation,
                       cout_trahison_cooperation,
                       cout_cooperation_trahison,
                       id_strategie1,
                       id_strategie2))
                
                #for i in range(nb_iterations)

tournoi(10,1,2,3,2,[1,2,3])
