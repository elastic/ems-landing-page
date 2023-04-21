#!/usr/bin/env bash
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -e
set +x

echo "--- :compression: Downloading and uncompressing the build"
buildkite-agent artifact download release.tar.gz .
tar -xvzf release.tar.gz

if [[ ! -d ./build/release ]]; then
    echo "--- :fire:  There is no release to upload" 1>&2
    exit 1
fi

SOURCE_PATH="./build/release/"

case ${EMS_ENVIRONMENT} in
    "staging")
        DEST_BUCKET="gs://${STAGING_BUCKET}"
    ;;
    "production")
        DEST_BUCKET="gs://${PRODUCTION_BUCKET}"
    ;;
    "*")
        echo "--- :fire: ${EMS_ENVIRONMENT}  is not a valid environment definition" 1>&2
        exit 1
esac

BRANCH="${BUILDKITE_BRANCH#*:}"
DEST_PATH="${DEST_BUCKET}/${BRANCH}/"


# The trailing slash is critical with the branch.
# Otherwise, files from subdirs will go to the same destination dir.
echo "--- :gcloud: Sync ${SOURCE_PATH} to ${DEST_PATH}"
gsutil -m rsync -d -r -a public-read -j js,css,html "${SOURCE_PATH}" "${DEST_PATH}" 

# If the branch name matches ROOT_BRANCH, it also gets synced to the root
# excluding paths matching other versions to avoid removing them (v2, v7.x, etc.)
if [[ "$BRANCH" == "$ROOT_BRANCH" ]]; then
    echo "--- :gcloud: Sync ${SOURCE_PATH} to ${DEST_BUCKET}"
    gsutil -m rsync -d -r -a public-read -j js,css,html  -x '^v[\d.]+\/.*$' "${SOURCE_PATH}" "${DEST_BUCKET}/"
fi
