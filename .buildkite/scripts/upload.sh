#!/usr/bin/env bash
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -e
set +x

# Script to upload the result of a build into a GCP bucket, also synchronizing
# the release with the root of the bucket if the branch of the build is the same
# as the root branch set up in the pre-command script.
#
# Parameters:
# - BUILDKITE_BRANCH: the branch from which this build was triggered
# - EMS_ENVIRONMENT: defines if this is going to be a staging or production release
# - STAGING_BUCKET
# - PRODUCTION_BUCKET
# - ROOT_BRANCH

echo "--- :compression: Downloading and uncompressing the build"
buildkite-agent artifact download release.tar.gz .
tar -xvzf release.tar.gz

if [[ ! -d ./build/release ]]; then
    echo "--- :fire:  There is no release to upload" 1>&2
    exit 1
fi

SOURCE_PATH="./build/release/"

# Define the destination of the release
case ${EMS_ENVIRONMENT} in
    "staging")
        DEST_BUCKET="gs://${STAGING_BUCKET}"
        BRANCH="${BUILDKITE_BRANCH#*:}"
    ;;
    "production")
        DEST_BUCKET="gs://${PRODUCTION_BUCKET}"
        # When running from a tag, we need to extract the branch from git log :(
        BRANCH=$(git show -s --pretty=%d HEAD | sed -e 's/^.*origin\/\(.*\))$/\1/g')
    ;;
    "*")
        echo "--- :fire: ${EMS_ENVIRONMENT}  is not a valid environment definition" 1>&2
        exit 1
esac

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
