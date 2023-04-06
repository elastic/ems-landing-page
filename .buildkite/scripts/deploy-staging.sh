#
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -e
set +x

# Checking for the parameters

if [[ -z "${STAGING_BUCKET}" ]]; then
    echo "--- :fire:  STAGING_BUCKET is not set, e.g. 'STAGING_BUCKET=elastic-ems-dev-maps-landing-page-staging'" 1>&2
    exit 1
fi

if [[ -z "${BUILDKITE_BRANCH}" ]]; then
    echo "--- :fire:  BUILDKITE_BRANCH is not set, e.g. 'BUILDKITE_BRANCH=master'" 1>&2
    exit 1
fi

if [[ -z "${ROOT_BRANCH}" ]]; then
    echo "--- :fire:  ROOT_BRANCH is not set, e.g. 'ROOT_BRANCH=v7.2'" 1>&2
    exit 1
fi

echo "--- :compression: Downloading and uncompressing the build"
buildkite-agent artifact download release.tar.gz .
tar -xvzf release.tar.gz

if [[ ! -d ./build/release ]]; then
  echo "--- :fire:  There is no release to upload" 1>&2
  exit 1
fi

# TODO remove the "#*:" since this environment
# variable should not be coming from a fork where
# Buildkite uses the convention fork_author:branch
# i.e. jsanz:v8.7
BRANCH="${BUILDKITE_BRANCH#*:}"

# The trailing slash is critical with the branch.
# Otherwise, files from subdirs will go to the same destination dir.
echo "--- :gcloud: Sync ./build/release/* to gs://$STAGING_BUCKET/$BRANCH/"
gsutil -m rsync -d -r -a public-read -j js,css,html "./build/release/" "gs://$STAGING_BUCKET/$BRANCH/"

# If the branch name matches ROOT_BRANCH, it also gets synced to the root
# excluding paths matching other versions to avoid removing them (v2, v7.x, etc.)
if [[ "$BRANCH" == "$ROOT_BRANCH" ]]; then
    echo "--- :gcloud: Sync ./release/* to gs://$STAGING_BUCKET/"
    gsutil -m rsync -d -r -a public-read -j js,css,html  -x '^v[\d.]+\/.*$' "./build/release/" "gs://$STAGING_BUCKET/"
fi
