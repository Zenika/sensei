#!/bin/sh


docker container run \
  --rm \
  --volume $(pwd):/training-material \
  --cap-add=SYS_ADMIN \
  zenika/sensei pdf
