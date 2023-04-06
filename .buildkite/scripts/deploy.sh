#
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -e
set +x


function retry {
    local retries=$1
    shift

    local count=0
    until "$@"; do
        exit=$?
        wait=$((2 ** count))
        count=$((count + 1))
        if [ $count -lt "$retries" ]; then
            >&2 echo "Retry $count/$retries exited $exit, retrying in $wait seconds..."
            sleep $wait
        else
            >&2 echo "Retry $count/$retries exited $exit, no more retries left."
            return $exit
        fi
    done
    return 0
}

# Checking for the parameters

if [[ -z "${GCP_BUCKET}" ]]; then
    echo "--- :fire:  GCP_BUCKET is not set, e.g. 'GCP_BUCKET=elastic-ems-dev-maps-landing-page-staging'" 1>&2
    exit 1
fi

if [[ -z "${GIT_BRANCH}" ]]; then
    echo "--- :fire:  GIT_BRANCH is not set, e.g. 'GIT_BRANCH=refs/heads/master'" 1>&2
    exit 1
fi

if [[ -z "${ROOT_BRANCH}" ]]; then
    echo "--- :fire:  ROOT_BRANCH is not set, e.g. 'ROOT_BRANCH=v7.2'" 1>&2
    exit 1
fi


# Login to the Google Cloud with the service account
echo "--- :gcloud: Authenticate in GCP"
gcloud auth activate-service-account --quiet --key-file <(echo "$GCE_ACCOUNT_SECRET")
unset GCE_ACCOUNT_SECRET


echo "--- :compression: Downloading and uncompressing the build"
buildkite-agent artifact download release.tar.gz .
tar xzf release.tar.gz

# TODO remove the "#*:" since this environment
# variable should not be coming from a fork where
# Buildkite uses the convention fork_author:branch
# i.e. jsanz:v8.7
BRANCH="${BUILDKITE_BRANCH#*:}"

# Copy files

# The trailing slash is critical with the branch.
# Otherwise, files from subdirs will go to the same destination dir.
echo "--- :gcloud: Sync ./build/release/* to gs://$GCP_BUCKET/$BRANCH/"
gsutil -m rsync -d -r -a public-read -j js,css,html "./release/" "gs://$GCP_BUCKET/$BRANCH/"

# If the branch name matches ROOT_BRANCH, it also gets synced to the root
# excluding paths matching other versions to avoid removing them (v2, v7.x, etc.)
if [[ "$BRANCH" == "$ROOT_BRANCH" ]]; then
    echo "--- :gcloud: Sync ./release/* to gs://$GCP_BUCKET/"
    gsutil -m rsync -d -r -a public-read -j js,css,html  -x '^v[\d.]+\/.*$' "./release/" "gs://$GCP_BUCKET/"
fi
