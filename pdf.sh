#!/bin/sh

TRAINING_NAME=$(basename $(pwd))

docker container run \
  --rm \
  --volume $(pwd):/${TRAINING_NAME} \
  --workdir /${TRAINING_NAME} \
  --cap-add=SYS_ADMIN \
  zenika/sensei pdf
