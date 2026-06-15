import subprocess
import platform
from pathlib import Path

# Sélection de l'exécutable en fonction de l'OS
if platform.system() == "Windows":
    executable = Path(__file__).parent / "rhai_runner" / "executables" / "rhai_runner.exe"
else:
    executable = Path(__file__).parent / "rhai_runner" / "executables" / "rhai_runner"

def choix(script,
          actions_courante,
          actions_adverse,
          cout_trahison,
            cout_cooperation,
            cout_trahison_cooperation,
            cout_cooperation_trahison
          ):
    #Appel de l'exécutable
    result = subprocess.run(
        [
            str(executable),
            script,
            actions_courante,
            actions_adverse,
            cout_trahison,
            cout_cooperation,
            cout_trahison_cooperation,
            cout_cooperation_trahison,
        ],
        capture_output=True,
        text=True
    )

    #Gestion des erreurs
    if result.returncode != 0:
        print(result.stderr)
        raise SystemExit(result.returncode)
    
    #Renvoie de la valeur
    return result.stdout[:-1]
