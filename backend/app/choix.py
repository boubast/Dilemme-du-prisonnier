import subprocess
import platform

if platform.system() == "Windows":
    executable = "./rhai_runner/executables/rhai_runner.exe"
else:
    executable = "./rhai_runner/executables/rhai_runner"

def choix(script,
          actions_courante,
          actions_adverse,
          cout_trahison,
            cout_cooperation,
            cout_trahison_cooperation,
            cout_cooperation_trahison
          ):
    print(actions_courante)
    result = subprocess.run(
        [
            executable,
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
    if result.returncode != 0:
        print(result.stderr)
        raise SystemExit(result.returncode)
    
    return result.stdout[:-1]