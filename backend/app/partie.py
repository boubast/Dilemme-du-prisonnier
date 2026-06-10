from choix import choix

def partie(nb_iterations,
           cout_trahison,
           cout_cooperation,
           cout_trahison_cooperation,
           cout_cooperation_trahison,
           script1,
           script2):
    actions_strat1 = []
    actions_strat2 = []
    actions_strat1_str = "["
    actions_strat2_str = "["
    choix_strat1 = ""
    choix_strat2 = ""
    for i in range(nb_iterations):
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
        
        actions_strat1.append(int(choix_strat1))
        actions_strat2.append(int(choix_strat2))

        if i==0:
            actions_strat1_str = actions_strat1_str + choix_strat1
            actions_strat2_str = actions_strat2_str + choix_strat2
        else:
            actions_strat1_str = actions_strat1_str + "," + choix_strat1
            actions_strat2_str = actions_strat2_str + "," + choix_strat2
    return actions_strat1,actions_strat2


print(partie(10,"1","2","3","0","return 0;","return 1;"))
print(partie(10,"1","2","3","0","return 0;","return rand(0,1);"))
print(partie(10,"1","2","3","0","return 0;","if len(derniers_coups_strategie_adverse)==0{return 0;} else{return derniers_coups_strategie_adverse[-1]};"))
print(partie(10,"1","2","3","0","return rand(0,1);","if len(derniers_coups_strategie_adverse)==0{return 0;} else{return derniers_coups_strategie_adverse[-1]};"))
