#!/bin/sh

docker container run \
  --interactive \
  --tty \
  --rm \
  --volume $(pwd):/slides \
  --net host \
  astefanutti/decktape http://localhost:8080 slides.pdf
