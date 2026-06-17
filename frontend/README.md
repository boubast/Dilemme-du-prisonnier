# Frontend

Ce dossier contient le frontend React, TypeScript, Tailwind CSS et shadcn/ui. Il est configure avec Vite et servi par Nginx dans Docker.

## Role

- afficher l'interface de gestion des strategies ;
- configurer et lancer des tournois ;
- afficher l'historique, les resultats et les statistiques ;
- appeler l'API backend via `VITE_API_URL` et `VITE_API_PREFIX`.

## Structure

```text
frontend/
├── src/
│   ├── api/          # Clients HTTP vers le backend
│   ├── components/   # Composants React reutilisables
│   ├── dto/          # Mapping des donnees API
│   ├── hooks/        # Hooks React metier
│   ├── layouts/      # Layouts de page
│   ├── lib/          # Utilitaires
│   ├── pages/        # Pages routees
│   ├── App.tsx       # Routes principales
│   └── main.tsx      # Point d'entree React
├── Dockerfile
├── nginx.conf
├── package.json
└── README.md
```

## Installation des dépendances

```bash
npm i
```

## Lancer l'application en local

Pour lancer l'app en mode developpement :

```bash
npm run dev
```

Le frontend local est generalement disponible sur `http://localhost:5173`.

## Lancer avec Docker

Depuis la racine :

```bash
docker compose up --build frontend
```

Dans Docker, Vite compile l'application, puis Nginx sert les fichiers statiques sur le port interne `80`. Le port hote est configure par `FRONTEND_PORT`.

Les variables `VITE_*` sont injectees au moment du build Vite. Apres modification de `VITE_API_URL` ou `VITE_API_PREFIX`, reconstruire l'image frontend.

## Commandes utiles

```bash
npm run build
npm run lint
npm run typecheck
npm run format
```

## Ajout des composants

Pour ajouter un nouveau composant shadcn/ui:

```bash
npx shadcn@latest add button
```

Cela placera les composants dans le repertoire `src/components`.
