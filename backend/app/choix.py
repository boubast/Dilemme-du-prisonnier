import os
import tempfile
from pathlib import Path
from threading import Lock
from wasmtime import Store, Module, Linker, Engine, Config, WasiConfig, Trap

class RhaiScriptError(Exception):
    def __init__(self, strategy_id: int, strategy_name: str, iteration: int, message: str):
        self.strategy_id = strategy_id
        self.strategy_name = strategy_name
        self.iteration = iteration
        self.message = message
        super().__init__(f"Strategy '{strategy_name}' (ID: {strategy_id}) failed at iteration {iteration}: {message}")

# Classe pour la gestion Singleton Multithread
class SingletonMeta(type):
    _instances = {}

    _lock: Lock = Lock()

    def __call__(cls, *args, **kwargs):
        with cls._lock:
            if cls not in cls._instances:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance
        return cls._instances[cls]

class MoteurChoix(metaclass=SingletonMeta):

    def __init__(self):
        # Configuration du fuel pour limiter le nombre d'instructions exécutées par le script
        config = Config()
        config.consume_fuel = True
        self.engine = Engine(config)
        
        self.module_classique = Module.from_file(self.engine, Path(__file__).parent / "rhai_runner" / "executables" / "rhai_runner.wasm")

        self.module_multi = Module.from_file(self.engine, Path(__file__).parent / "rhai_runner_multi" / "executables" / "rhai_runner_multi.wasm")

        self.linker = Linker(self.engine)
        self.linker.define_wasi()

    def choix_preparation(self):
        #Configuration commune

        # Configuration et exécution d'un script avec limite de 40 000 000 instructions
        store = Store(self.engine)
        store.set_fuel(40000000)

        wasi = WasiConfig()
        output_file = tempfile.NamedTemporaryFile(delete=False)
        output_file.close()
        error_file = tempfile.NamedTemporaryFile(delete=False)
        error_file.close()
        wasi.stdout_file = output_file.name
        wasi.stderr_file = error_file.name
        
        return store,wasi,output_file,error_file

    def choix_fin(self,instance,store,output_file):
        #Fin de l'exécution
        start = instance.exports(store)["_start"]

        start(store)
        
        result = ""
        with open(output_file.name, encoding="utf-8") as f:
            result = f.read().strip()

        return result
    
    def choix_main(self,args,module):
        try:
            store,wasi,output_file,error_file = self.choix_preparation()

            wasi.argv = args
            store.set_wasi(wasi)

            instance = self.linker.instantiate(store, module)
            return self.choix_fin(instance,store,output_file)

        # Gestion des erreurs spécifiques à l'exécution du script
        except Trap:
            return "Erreur: Le script a été interrompu (Dépassement de la limite d'instructions / boucle infinie)"
        except Exception as e:
            try:
                with open(error_file.name, encoding="utf-8") as f:
                    err_content = f.read().strip()
                if err_content:
                    return f"Erreur: {err_content}"
            except Exception:
                pass
            return f"Erreur: {str(e)}"
        finally:
            if os.path.exists(output_file.name):
                os.unlink(output_file.name)
            if os.path.exists(error_file.name):
                os.unlink(error_file.name)

    def choix_classique(self,script,
            actions_courante,
            actions_adverse,
            cout_trahison,
            cout_cooperation,
            cout_trahison_cooperation,
            cout_cooperation_trahison
            ):
        #Choix classique, pour une itération entre 2 stratégies
        
        #Préparation des arguments pour l'appel
        args = ["",script,
                actions_courante,
                actions_adverse,
                cout_trahison,
                cout_cooperation,
                cout_trahison_cooperation,
                cout_cooperation_trahison]

        return self.choix_main(args,self.module_classique)  
    
    def choix_multi(self,script,
            actions,
            actions_strats,
            id_courant
            ):
        #Choix multijoueurs

        #Préparation des arguments pour l'appel
        args = ["",script,
                actions,
                actions_strats,
                id_courant]

        return self.choix_main(args,self.module_multi)
