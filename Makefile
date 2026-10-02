COMPOSE = podman-compose --env-file .env

IMAGE = localhost/transcendence_backend:latest

all: up db

up:
	$(COMPOSE) up --build -d

db:
	$(COMPOSE) exec backend npx prisma db push

down:
	$(COMPOSE) down $(DOWN_FLAGS)

clean: DOWN_FLAGS = --volumes --remove-orphans
clean: down
	-podman image rm -f $(IMAGE)

re: down all

.PHONY: all up down clean re
