COMPOSE = podman-compose --env-file .env

IMAGE = localhost/transcendence_backend:latest

all: up db

up:
	$(COMPOSE) up --build -d

db:
	$(COMPOSE) exec backend npx prisma db push

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down --volumes --remove-orphans
	-podman image rm -f $(IMAGE)

re: down all

.PHONY: all up down clean re
