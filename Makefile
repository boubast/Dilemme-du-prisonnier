SHELL := /bin/bash

.DEFAULT_GOAL := help

COMPOSE := docker compose

.PHONY: help env up build down restart logs ps backend-shell postgres-shell frontend-install frontend-dev frontend-build frontend-lint frontend-typecheck

help:
	@echo "Commandes disponibles :"
	@echo "  make env                Cree .env depuis .env.example si absent"
	@echo "  make up                 Lance les services Docker Compose"
	@echo "  make build              Reconstruit puis lance les services"
	@echo "  make down               Arrete et supprime les conteneurs"
	@echo "  make restart            Redemarre les services avec reconstruction"
	@echo "  make logs               Affiche les logs Docker Compose"
	@echo "  make ps                 Affiche l'etat des services"
	@echo "  make backend-shell      Ouvre un shell dans le conteneur backend"
	@echo "  make postgres-shell     Ouvre psql dans le conteneur PostgreSQL"
	@echo "  make frontend-install   Installe les dependances frontend"
	@echo "  make frontend-dev       Lance Vite en local"
	@echo "  make frontend-build     Compile le frontend"
	@echo "  make frontend-lint      Lance ESLint"
	@echo "  make frontend-typecheck Lance TypeScript en verification"

env:
	@test -f .env || cp .env.example .env

up: env
	$(COMPOSE) up

build: env
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

restart: down build

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

backend-shell:
	$(COMPOSE) exec backend bash

postgres-shell:
	$(COMPOSE) exec postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

frontend-typecheck:
	cd frontend && npm run typecheck
