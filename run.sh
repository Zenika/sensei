#!/bin/sh

docker container run \
  --interactive \
  --tty \
  --rm \
  --volume $(pwd):/app/training-material \
  --publish 8080:8080 \
  zenika/sensei
