class strategie:
    @staticmethod
    def get(id):
        match id:
            case 1:
                return "return 0;"
            case 2:
                return "return 1;"
            case 3:
                return "return rand(0,1);"
            case 4:
                return "if len(derniers_coups_strategie_adverse)==0{return 0;} else{return derniers_coups_strategie_adverse[-1]};"