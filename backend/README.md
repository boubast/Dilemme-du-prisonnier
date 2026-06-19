# Backend

Ce dossier contient l'API FastAPI, le moteur de tournoi et l'integration du runner Rhai utilise pour executer les strategies.

## Role

- exposer les routes HTTP des strategies et des tournois ;
- valider et executer les scripts Rhai des strategies ;
- lire et ecrire les donnees PostgreSQL via SQLAlchemy ;
- retourner les resultats de tournoi au frontend.

## Structure

```text
backend/
├── app/
│   ├── main.py          # Creation de l'application FastAPI
│   ├── database.py      # Configuration SQLAlchemy/PostgreSQL
│   ├── choix.py         # Execution des choix de strategie
│   ├── partie.py        # Logique de partie
│   ├── tournoi.py       # Logique de tournoi
│   ├── models/          # Modeles SQLAlchemy
│   ├── routers/         # Routes FastAPI
│   ├── schemas/         # Schemas Pydantic
│   └── rhai_runner/     # Runner Rust/Rhai compile en WASM
├── Dockerfile
├── requirements.txt
└── README.md
```

## Lancement avec Docker

Depuis la racine du projet :

```bash
docker compose up --build backend
```

L'API est exposee sur le port `BACKEND_PORT` de `.env`, `8000` par defaut.

## Lancement local

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py
```

Si le backend tourne hors Docker mais PostgreSQL tourne dans Docker, utiliser `POSTGRES_ADRESS=localhost` dans `.env`.

## Acces API

- Sante : `http://localhost:8000/health`
- Swagger UI : `http://localhost:8000/docs`
- Strategies : `http://localhost:8000/api/v1/strategy`
- Tournois : `http://localhost:8000/api/v1/tournament`

Le prefixe `/api/v1` vient de la variable `API_PREFIX`.
