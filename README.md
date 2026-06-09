# Dilemme du prisonnier

Ce projet propose une application d'expérimentation autour du dilemme du prisonnier. Le dilemme du prisonnier est un problème de théorie des jeux dans lequel plusieurs agents doivent choisir entre coopérer ou trahir. Chaque choix influence le score individuel et le résultat collectif.

L'application sert à configurer des expériences, lancer des parties entre différentes stratégies et comparer leurs résultats. Elle permettra notamment de tester des stratégies classiques comme `Always Cooperate`, `Always Betray`, `Random` ou `Tit for Tat`, puis d'observer leur comportement dans différents scénarios.

## À quoi sert l'application ?

- Créer et tester des stratégies de jeu.
- Lancer des expériences autour du dilemme du prisonnier.
- Comparer les performances des stratégies.
- Visualiser les résultats des expériences.
- Fournir un backend API pour gérer les expériences et les résultats.

## Structure du projet

```text
.
├── .env.example
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## Configuration

La configuration du projet est centralisée dans un fichier `.env`.

Pour créer le fichier local à partir de l'exemple :

```bash
cp .env.example .env
```

Variables disponibles :

- `BACKEND_HOST` : adresse d'écoute du backend FastAPI.
- `BACKEND_PORT` : port exposé pour accéder au backend.
- `FRONTEND_PORT` : port exposé pour accéder au frontend.
- `VITE_API_URL` : URL de l'API utilisée par le frontend.
- `COMPOSE_PROJECT_NAME` : nom du projet Docker Compose.

## Lancement avec Docker Compose

Depuis la racine du projet, lancer :

```bash
docker compose up
```

Pour reconstruire les images avant le lancement :

```bash
docker compose up --build
```

L'API backend est disponible sur :

```text
http://localhost:8000
```

Le frontend React est disponible sur :

```text
http://localhost:5173
```

La route de santé permet de vérifier que l'API fonctionne :

```text
http://localhost:8000/health
```

Pour arrêter les conteneurs :

```bash
docker compose down
```
