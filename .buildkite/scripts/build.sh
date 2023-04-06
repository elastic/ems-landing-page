#
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -eu

echo "--- :yarn:  Installing dependencies"
yarn install

echo "--- :gear: Building"
yarn build

echo "--- :compression:  Generate artifact"
tar -cvzf release.tar.gz build/release
