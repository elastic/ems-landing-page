#!/bin/bash

#
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -e

NODE_IMG="node:hydrogen"

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
    bash -c '/opt/yarn*/bin/yarn && yarn run build'
