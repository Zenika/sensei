#!/bin/sh

docker container run \
  --rm \
  --volume $(pwd)/pdf:/app/pdf \
  --net host \
  --cap-add=SYS_ADMIN \
  zenika/sensei-pdf slides

docker container run \
  --rm \
  --volume $(pwd)/pdf:/app/pdf \
  --net host \
  --cap-add=SYS_ADMIN \
  zenika/sensei-pdf labs
