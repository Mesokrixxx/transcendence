PACKAGE_NAME = transcendence-backend
PORT = 8080

all: build run

build:
	podman build -t $(PACKAGE_NAME) .

run:
	podman run --rm --name $(PACKAGE_NAME) -p $(PORT):$(PORT) $(PACKAGE_NAME)

stop:
	podman stop $(PACKAGE_NAME)

clean:
	podman rm -f $(PACKAGE_NAME)
	podman rmi $(PACKAGE_NAME)

re: clean all
