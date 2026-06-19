# Base de donnees

Ce dossier contient le script d'initialisation PostgreSQL du projet.

## Fichier

- `init.sql` : cree les tables, contraintes, triggers et strategies initiales.

## Initialisation Docker

Dans `docker-compose.yml`, le script est monte dans le conteneur PostgreSQL :

```yaml
./db/init.sql:/docker-entrypoint-initdb.d/init.sql
```

PostgreSQL execute ce script uniquement lors de la premiere creation du volume de donnees. Si le volume `postgres_data` existe deja, modifier `init.sql` ne rejouera pas automatiquement le script.

## Acces

Depuis la racine du projet :

```bash
docker compose exec postgres psql -U bastienbogoss -d prisoners-dilemma
```

Ou avec le Makefile :

```bash
make postgres-shell
```

Parametres par defaut :

- hote depuis Docker Compose : `postgres` ;
- hote depuis la machine : `localhost` ;
- port : `5432` ;
- base : `prisoners-dilemma`.

## Schema de la base de donnees

```mermaid
erDiagram
    STRATEGIE {
        BIGINT id_strategie PK
        VARCHAR nom
        TEXT explication
        TEXT script_rhai
        type_tournoi type_strategie
    }

    TOURNOI {
        BIGINT id_tournoi PK
        DATE date_creation
        VARCHAR meilleure_strategie
        type_tournoi type_tournoi
    }

    TOURNOI_CLASSIQUE {
        BIGINT id_tournoi PK, FK
        INT nb_iterations
        INT cout_coop_coop
        INT cout_coop_trahi
        INT cout_trahi_coop
        INT cout_trahi_trahi
    }

    TOURNOI_MULTI {
        BIGINT id_tournoi PK, FK
        SMALLINT duree_secondes
    }

    PARTIE {
        BIGINT id_partie PK
        BIGINT id_strategie_1 FK
        BIGINT id_strategie_2 FK
        BIGINT id_tournoi FK
    }

    ITERATION {
        BIGINT id_iteration PK
        BIGINT id_partie FK
        INT numero_iteration
        BOOLEAN choix_strategie_1
        BOOLEAN choix_strategie_2
    }

    PARTICIPATION {
        BIGINT id_tournoi PK, FK
        BIGINT id_strategie PK, FK
    }

    PARTICIPATION_MULTI {
        BIGINT id_tournoi PK, FK
        BIGINT id_strategie PK, FK
        SMALLINT nombre_trahisons
        SMALLINT nombre_cooperations
        SMALLINT score
    }

    TOURNOI ||--o| TOURNOI_CLASSIQUE : specialise
    TOURNOI ||--o| TOURNOI_MULTI : specialise
    STRATEGIE ||--o{ PARTIE : "strategie 1"
    STRATEGIE ||--o{ PARTIE : "strategie 2"
    TOURNOI_CLASSIQUE ||--o{ PARTIE : contient
    PARTIE ||--o{ ITERATION : contient
    TOURNOI_CLASSIQUE ||--o{ PARTICIPATION : comprend
    STRATEGIE ||--o{ PARTICIPATION : participe
    TOURNOI_MULTI ||--o{ PARTICIPATION_MULTI : comprend
    STRATEGIE ||--o{ PARTICIPATION_MULTI : participe
```
@enduml
```
