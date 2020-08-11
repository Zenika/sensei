#!/bin/sh

docker image build . --tag zenika/sensei

cd src/pdf

docker image build . --tag zenika/sensei-pdf
