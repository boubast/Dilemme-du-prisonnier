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
        
        self.module = Module.from_file(self.engine, Path(__file__).parent / "rhai_runner" / "executables" / "rhai_runner.wasm")

    def choix(self, script,
            actions_courante,
            actions_adverse,
            cout_trahison,
            cout_cooperation,
            cout_trahison_cooperation,
            cout_cooperation_trahison
            ):
        # Configuration et exécution d'un script avec limite de 40 000 000 instructions
        store = Store(self.engine)
        store.set_fuel(40000000)

        wasi = WasiConfig()

        output_file = tempfile.NamedTemporaryFile(delete=False)
        output_file.close()
        error_file = tempfile.NamedTemporaryFile(delete=False)
        error_file.close()

        try:
            wasi.stdout_file = output_file.name
            wasi.stderr_file = error_file.name

            wasi.argv = ["", script,
                actions_courante,
                actions_adverse,
                cout_trahison,
                cout_cooperation,
                cout_trahison_cooperation,
                cout_cooperation_trahison]
            store.set_wasi(wasi)

            linker = Linker(self.engine)
            linker.define_wasi()

            instance = linker.instantiate(store, self.module)
            start = instance.exports(store)["_start"]

            start(store)
        
            result = ""
            with open(output_file.name, encoding="utf-8") as f:
                result = f.read().strip()
        
            return result
        # Gestion des erreurs spécifiques à l'exécution du script
        except Trap:
            return "Error: The script was interrupted (instruction limit exceeded or infinite loop)"
        except Exception as e:
            try:
                with open(error_file.name, encoding="utf-8") as f:
                    err_content = f.read().strip()
                if err_content:
                    return f"Error: {err_content}"
            except Exception:
                pass
            return f"Error: {str(e)}"
        finally:
            if os.path.exists(output_file.name):
                os.unlink(output_file.name)
            if os.path.exists(error_file.name):
                os.unlink(error_file.name)
