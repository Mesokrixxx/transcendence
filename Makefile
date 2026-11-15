COMPOSE = podman-compose --env-file .env

IMAGE = localhost/transcendence_backend:latest

all: up db

up: certs
	$(COMPOSE) up --build --force-recreate -d

db:
	$(COMPOSE) exec backend npx prisma db push

down:
	$(COMPOSE) down $(DOWN_FLAGS)

clean: DOWN_FLAGS = --volumes --remove-orphans
clean: down
	-podman image rm -f $(IMAGE)

re: down all

certs:
	./scripts/generate-certs.sh

.PHONY: all up down clean re certs
