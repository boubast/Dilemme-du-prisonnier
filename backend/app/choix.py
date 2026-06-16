from wasmtime import Store,Module,Instance,Linker,Engine
from wasmtime import WasiConfig
from threading import Lock, Thread
from pathlib import Path

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
        #Initialisation du moteur d'exécution WASM
        #Long à exécuter (~0,5s), d'où le fonctionnement en Singleton

        self.engine = Engine()
        
        self.module = Module.from_file(self.engine,Path(__file__).parent / "rhai_runner" / "executables" / "rhai_runner.wasm")

        self.linker = Linker(self.engine)
        self.linker.define_wasi()

    def choix(self,script,
            actions_courante,
            actions_adverse,
            cout_trahison,
                cout_cooperation,
                cout_trahison_cooperation,
                cout_cooperation_trahison
            ):
        #Configuration et exécution d'un script

        self.store = Store(self.engine)

        self.wasi = WasiConfig()
        self.wasi.inherit_stdout()
        self.wasi.inherit_stderr()
        self.wasi.stdout_file = "stdout.txt"
        
        self.wasi.argv = ["",script,
                actions_courante,
                actions_adverse,
                cout_trahison,
                cout_cooperation,
                cout_trahison_cooperation,
                cout_cooperation_trahison]
        self.store.set_wasi(self.wasi)

        instance = self.linker.instantiate(self.store, self.module)

        self.start = instance.exports(self.store)["_start"]

        self.start(self.store)
        
        result = ""
        with open("stdout.txt", encoding="utf-8") as f:
            result = f.read().strip()
        
        return result

        #TODO : Gestion des erreurs