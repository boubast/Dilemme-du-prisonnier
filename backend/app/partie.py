from choix import choix

nb_iterations = 10
cout_trahison = "1"
cout_cooperation = "2"
cout_trahison_cooperation = "3"
cout_cooperation_trahison = "0"

script1 = "print('C')"
script2 = "print('T')"

actions_strat1 = []
actions_strat2 = []

def partie():
    actions_strat1_str = "["
    actions_strat2_str = "["
    choix_strat1 = ""
    choix_strat2 = ""
    for i in range(nb_iterations):
        choix_strat1 = choix_partie(script1,actions_strat1_str + "]",actions_strat2_str + "]")
        choix_strat2 = choix_partie(script2,actions_strat2_str + "]",actions_strat1_str + "]")
        
        actions_strat1.append(choix_strat1)
        actions_strat2.append(choix_strat2)

        if i==0:
            actions_strat1_str = actions_strat1_str + "'" + choix_strat1 + "'"
            actions_strat2_str = actions_strat2_str + "'" + choix_strat2 + "'"
        else:
            actions_strat1_str = actions_strat1_str + ",'" + choix_strat1 + "'"
            actions_strat2_str = actions_strat2_str + ",'" + choix_strat2 + "'"

def choix_partie(script,
          actions_courante,
          actions_adverse):
    return choix(script,
          actions_courante,
          actions_adverse,
          cout_trahison,
          cout_cooperation,
          cout_trahison_cooperation,
          cout_cooperation_trahison)


partie()
print("fin : " + str(actions_strat1))
print("fin : " + str(actions_strat2))