#!/bin/bash
#
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -eu

echo "--- :yarn:  Installing dependencies"
yarn install

echo "--- :gear: Building"

export EUI_THEME="borealis"

# If the BUILDKITE_BRANCH starts with v8 or v7, switch to the amsterdam theme
if [[ "${BUILDKITE_BRANCH}" == v8* || "${BUILDKITE_BRANCH}" == v7* ]] ; then
  echo "Using 🇳🇱 Amsterdam 🇳🇱 theme for v8 or v7 branches"
  export EUI_THEME="amsterdam"
else

  echo "Using 🌠 Borealis 🌠 theme"
fi

if [[ -n ${BUILDKITE+x} ]] ; then
  yarn build
else
  yarn build-unsafe
fi

if [[ "${BUILDKITE_BRANCH}" == "${BUILDKITE_PIPELINE_DEFAULT_BRANCH}"* ]] ; then
  echo "--- :elastic-cloud: Replacing version in config.json"
  yarn serverless
fi

if [[ -n ${BUILDKITE+x} ]] ; then
echo "--- :compression:  Generate artifact"
tar -cvzf release.tar.gz build/release
fi
