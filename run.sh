#!/bin/sh

TRAINING_NAME=$(basename $(pwd))

docker container run \
  --interactive \
  --tty \
  --rm \
  --volume $(pwd):/${TRAINING_NAME} \
  --workdir /${TRAINING_NAME} \
  --publish 8080:8080 \
  zenika/sensei
