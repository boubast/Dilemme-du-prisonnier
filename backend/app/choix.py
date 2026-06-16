import os
import tempfile
from pathlib import Path
from threading import Lock

from wasmtime import Store, Module, Linker, Engine
from wasmtime import WasiConfig

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

    def choix(self,script,
            actions_courante,
            actions_adverse,
            cout_trahison,
                cout_cooperation,
                cout_trahison_cooperation,
                cout_cooperation_trahison
            ):
        #Configuration et exécution d'un script

        store = Store(self.engine)

        wasi = WasiConfig()
        wasi.inherit_stdout()
        wasi.inherit_stderr()

        output_file = tempfile.NamedTemporaryFile(delete=False)
        output_file.close()

        try:
            wasi.stdout_file = output_file.name

            wasi.argv = ["",script,
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
        finally:
            os.unlink(output_file.name)

        #TODO : Gestion des erreurs
