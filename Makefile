DOCKER ?= docker

ORG=quay.io/parodos/
IMAGE=orion-ui

GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD | sed s,^main$$,latest,g)
GIT_HASH := $(shell git rev-parse HEAD)

build-image:
	./scripts/build-image.sh
	$(DOCKER) tag backstage:latest  $(ORG)$(IMAGE):$(GIT_BRANCH)
	$(DOCKER) tag backstage:latest  $(ORG)$(IMAGE):$(GIT_HASH)

push-image:
	$(DOCKER) push $(ORG)$(IMAGE):$(GIT_HASH)
	$(DOCKER) push $(ORG)$(IMAGE):$(GIT_BRANCH)
