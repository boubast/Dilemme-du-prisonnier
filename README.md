# Dilemme du prisonnier

Application d'experimentation autour du dilemme du prisonnier. Elle permet de creer des strategies, de lancer des tournois entre ces strategies et de comparer leurs resultats.

Le projet est compose de trois services Docker :

- un frontend React/Vite servi par Nginx ;
- une API backend FastAPI ;
- une base de donnees PostgreSQL initialisee par `db/init.sql`.

## Prerequis

- Docker et Docker Compose ;
- `make` pour utiliser les raccourcis du `Makefile` ;
- Node.js 20+ uniquement pour le developpement frontend hors Docker ;
- Python 3.12+ uniquement pour le developpement backend hors Docker.

## Structure

```text
.
├── backend/              # API FastAPI, moteur de tournoi et execution Rhai
├── db/                   # Script SQL d'initialisation PostgreSQL
├── frontend/             # Application React/Vite
├── .env.example          # Exemple de configuration locale
├── docker-compose.yml    # Orchestration des services
├── Makefile              # Raccourcis de developpement
└── README.md             # Documentation developpeur generale
```

Chaque dossier applicatif contient aussi un `README.md` avec son role et ses commandes utiles.

## Configuration `.env`

La configuration locale se trouve dans `.env`. Ce fichier est ignore par Git car il peut contenir des informations propres a la machine ou des secrets.

Pour creer la configuration locale :

```bash
cp .env.example .env
```

Ou avec le Makefile :

```bash
make env
```

Variables disponibles :

| Variable | Exemple | Description |
| --- | --- | --- |
| `BACKEND_HOST` | `0.0.0.0` | Adresse d'ecoute du backend dans le conteneur. |
| `BACKEND_PORT` | `8000` | Port expose sur la machine hote pour acceder a l'API. |
| `API_PREFIX` | `/api/v1` | Prefixe des routes metier FastAPI. |
| `FRONTEND_PORT` | `5173` | Port expose sur la machine hote pour acceder au frontend. |
| `VITE_API_URL` | `http://localhost:8000` | URL du backend appelee par le frontend. |
| `VITE_API_PREFIX` | `/api/v1` | Prefixe API utilise par les clients HTTP du frontend. |
| `POSTGRES_ADRESS` | `postgres` | Hote PostgreSQL utilise par le backend. Dans Docker Compose, garder `postgres`. |
| `POSTGRES_DB` | `prisoners-dilemma` | Nom de la base de donnees. |
| `POSTGRES_USER` | `bastienbogoss` | Utilisateur PostgreSQL. |
| `POSTGRES_PASSWORD` | `bastienbogoss` | Mot de passe PostgreSQL. |
| `COMPOSE_PROJECT_NAME` | `dilemme_prisonnier` | Nom du projet Docker Compose. |

`POSTGRES_ADRESS` conserve volontairement l'orthographe actuelle du code. Si elle est renommee plus tard en `POSTGRES_ADDRESS`, il faudra modifier `backend/app/database.py`, `.env`, `.env.example` et la documentation.

## `.env.example`

`.env.example` sert de modele partageable pour les nouveaux developpeurs. Il doit rester versionne et ne doit pas contenir de secret de production.

Quand une variable est ajoutee dans le code ou dans `docker-compose.yml`, elle doit aussi etre ajoutee dans `.env.example` avec un commentaire court.

## Lancement avec Docker Compose

Depuis la racine du projet :

```bash
docker compose up --build
```

Cette commande :

- construit l'image du backend depuis `backend/Dockerfile` ;
- construit l'image du frontend depuis `frontend/Dockerfile` ;
- lance PostgreSQL avec l'image `postgres:17` ;
- initialise la base avec `db/init.sql` lors de la premiere creation du volume ;
- expose le frontend, l'API et PostgreSQL sur la machine hote.

Equivalent Makefile :

```bash
make build
```

Pour relancer sans reconstruire les images :

```bash
docker compose up
```

Equivalent Makefile :

```bash
make up
```

## Arret des services

Pour arreter et supprimer les conteneurs, reseaux par defaut et ressources Compose temporaires :

```bash
docker compose down
```

Equivalent Makefile :

```bash
make down
```

Cette commande ne supprime pas le volume PostgreSQL `postgres_data`. Les donnees restent donc disponibles au prochain lancement. Pour repartir d'une base vide, supprimer explicitement le volume Docker apres avoir verifie que les donnees peuvent etre perdues.

## Acces au frontend

Avec la configuration par defaut :

```text
http://localhost:5173
```

Le port vient de `FRONTEND_PORT`. Dans Docker, l'application React est compilee puis servie par Nginx sur le port interne `80`.

## Acces a l'API backend

Avec la configuration par defaut :

```text
http://localhost:8000
```

Endpoints utiles :

- `GET /health` : verification simple que l'API repond ;
- `/docs` : documentation Swagger UI generee par FastAPI ;
- `/api/v1/strategy` : routes des strategies ;
- `/api/v1/tournament` : routes des tournois.

Exemple :

```bash
curl http://localhost:8000/health
```

## Acces a PostgreSQL

PostgreSQL est expose sur le port `5432` de la machine hote.

Parametres par defaut :

- hote depuis la machine : `localhost` ;
- hote depuis les conteneurs Docker : `postgres` ;
- port : `5432` ;
- base : valeur de `POSTGRES_DB` ;
- utilisateur : valeur de `POSTGRES_USER` ;
- mot de passe : valeur de `POSTGRES_PASSWORD`.

Connexion via Docker Compose :

```bash
docker compose exec postgres psql -U bastienbogoss -d prisoners-dilemma
```

Equivalent Makefile :

```bash
make postgres-shell
```

## Commandes Makefile

```bash
make help
```

Commandes principales :

- `make env` : cree `.env` depuis `.env.example` si le fichier n'existe pas ;
- `make build` : lance `docker compose up --build` ;
- `make up` : lance `docker compose up` ;
- `make down` : lance `docker compose down` ;
- `make logs` : suit les logs des services ;
- `make ps` : affiche l'etat des services ;
- `make backend-shell` : ouvre un shell dans le conteneur backend ;
- `make postgres-shell` : ouvre `psql` dans le conteneur PostgreSQL.

## Developpement local hors Docker

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py
```

Le backend local utilise les variables de `.env`. Pour communiquer avec PostgreSQL lance par Docker depuis la machine hote, mettre temporairement `POSTGRES_ADRESS=localhost`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Par defaut, le frontend appelle `VITE_API_URL` puis `VITE_API_PREFIX` ou `/api/v1` si `VITE_API_PREFIX` n'est pas defini. Avec Vite, les variables `VITE_*` sont lues au moment de la compilation du frontend.

## Depannage

### Le port 5173, 8000 ou 5432 est deja utilise

Modifier `FRONTEND_PORT` ou `BACKEND_PORT` dans `.env`, puis relancer `docker compose up --build`.

Pour PostgreSQL, le port hote est fixe dans `docker-compose.yml` (`5432:5432`). Si un PostgreSQL local tourne deja, l'arreter ou changer le port hote dans le compose.

### Le frontend ne contacte pas l'API

Verifier que `VITE_API_URL=http://localhost:8000` dans `.env`, puis reconstruire l'image frontend :

```bash
docker compose up --build frontend
```

Verifier aussi que le backend repond :

```bash
curl http://localhost:8000/health
```

### Le backend ne se connecte pas a PostgreSQL

Dans Docker Compose, `POSTGRES_ADRESS` doit valoir `postgres`. En lancement backend local hors Docker, cette variable doit generalement valoir `localhost`.

Consulter les logs :

```bash
docker compose logs backend postgres
```

### Les strategies initiales ne reapparaissent pas

`db/init.sql` n'est execute que lors de la premiere creation du volume PostgreSQL. Si le volume existe deja, relancer les conteneurs ne rejoue pas l'initialisation.

Pour repartir de zero, arreter Compose puis supprimer le volume PostgreSQL apres sauvegarde si necessaire.

### Une modification de Dockerfile ou de dependances n'est pas prise en compte

Reconstruire les images :

```bash
docker compose up --build
```
