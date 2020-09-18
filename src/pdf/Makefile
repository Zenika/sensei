.PHONY: build push
image_name=zenika/sensei-pdf

build:
	docker image build -t $(image_name) .

push: build
	docker image push $(image_name)
