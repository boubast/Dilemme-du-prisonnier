from choix import choix
from strategie import strategie

def partie(nb_iterations,
           cout_trahison,
           cout_cooperation,
           cout_trahison_cooperation,
           cout_cooperation_trahison,
           id_strategie1,
           id_strategie2):
    
    cout_trahison = str(cout_trahison)
    cout_cooperation = str(cout_cooperation)
    cout_trahison_cooperation = str(cout_trahison_cooperation)
    cout_cooperation_trahison = str(cout_cooperation_trahison)
    
    script1 = strategie.get(id_strategie1)
    script2 = strategie.get(id_strategie2)

    #TODO : A supprimer
    actions_strat1 = []
    actions_strat2 = []
    
    actions_strat1_str = "["
    actions_strat2_str = "["
    choix_strat1 = ""
    choix_strat2 = ""
    
    for iteration in range(nb_iterations):
        choix_strat1 = choix(script1,actions_strat1_str + "]",actions_strat2_str + "]",
                                    cout_trahison,
                                    cout_cooperation,
                                    cout_trahison_cooperation,
                                    cout_cooperation_trahison)
        choix_strat2 = choix(script2,actions_strat2_str + "]",actions_strat1_str + "]",
                                    cout_trahison,
                                    cout_cooperation,
                                    cout_trahison_cooperation,
                                    cout_cooperation_trahison)
        
        #TODO : Création Itérations
        actions_strat1.append(int(choix_strat1))
        actions_strat2.append(int(choix_strat2))

        if iteration==0: #On en met pas de virgule avant le premier élément des listes
            actions_strat1_str = actions_strat1_str + choix_strat1
            actions_strat2_str = actions_strat2_str + choix_strat2
        else:
            actions_strat1_str = actions_strat1_str + "," + choix_strat1
            actions_strat2_str = actions_strat2_str + "," + choix_strat2

    #TODO : A supprimer
    return actions_strat1,actions_strat2
