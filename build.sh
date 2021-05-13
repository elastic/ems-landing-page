#!/bin/bash
set -e

NODE_IMG="node:12"

# Compile using node image
echo "Compiling ${PWD} using ${NODE_IMG} docker image"
docker pull $NODE_IMG
docker run \
    --rm -i \
    --env GIT_COMMITTER_NAME=test \
    --env GIT_COMMITTER_EMAIL=test \
    --env HOME=/tmp \
    --user=$(id -u):$(id -g) \
    --volume $PWD:/app \
    --workdir /app \
    $NODE_IMG \
    bash -c 'npm config set spin false && /opt/yarn*/bin/yarn && yarn run build'
