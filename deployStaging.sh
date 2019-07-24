#!/bin/bash
set -e
set +x

# Two stage script: first it compiles using node docker container,
# then it runs itself from within another docker container to deploys to GCP

# Usage:
# * Compile and deploy:          ./deployStaging.sh
# * Deploy only without docker:  ./deployStaging.sh nodocker

# Expected env variables:
# * GPROJECT - "elastic-ems-prod" or "elastic-ems-dev"
# * GCE_ACCOUNT - credentials for the google service account (JSON blob)
# * GIT_BRANCH - current GIT branch (e.g. "refs/heads/master")
# * ROOT_BRANCH - name of the branch that should also be copied to the root, e.g. "v7.2"

if [[ -z "${GPROJECT}" ]]; then
    echo "GPROJECT is not set, e.g. 'GPROJECT=elastic-ems-prod'"
    exit 1
fi
if [[ -z "${GCE_ACCOUNT}" ]]; then
    echo "GCE_ACCOUNT is not set. Expected google service account JSON blob."
    exit 1
fi
if [[ -z "${GIT_BRANCH}" ]]; then
    echo "GIT_BRANCH is not set, e.g. 'GIT_BRANCH=refs/heads/master'"
    exit 1
fi
if [[ -z "${ROOT_BRANCH}" ]]; then
    echo "ROOT_BRANCH is not set, e.g. 'ROOT_BRANCH=v7.2'"
    exit 1
fi


if [[ "$1" != "nodocker" ]]; then

    ./build.sh

    # Run this script from inside the docker container, using google/cloud-sdk image
    echo "Deploying to staging environment"
    docker run \
        --rm -i \
        --env GCE_ACCOUNT \
        --env GIT_BRANCH \
        --env GPROJECT \
        --env ROOT_BRANCH \
        --env HOME=/tmp \
        --volume $PWD:/app \
        --user=$(id -u):$(id -g) \
        --workdir /app \
        'google/cloud-sdk:slim' \
        /app/deployStaging.sh nodocker "$@"
    unset GCE_ACCOUNT

else

    # Copying files to the staging environment
    # Login to the cloud with the service account
    gcloud auth activate-service-account --key-file <(echo "$GCE_ACCOUNT")
    unset GCE_ACCOUNT


    # All branches go into correspondingly named dirs.
    # remove remote "origin/", leaving just the branch name
    BRANCH="${GIT_BRANCH#*/}"

    # Copy files
    EMS_PROJECT=maps-landing-page
    STAGING_BUCKET=${GPROJECT}-${EMS_PROJECT}-staging

    # The trailing slash is critical with the branch.
    # Otherwise, files from subdirs will go to the same destination dir.
    echo "Copying $PWD/release/* to gs://$STAGING_BUCKET/$BRANCH/"
    gsutil -m cp -r -a public-read -z js,css,html "$PWD/build/release/*" "gs://$STAGING_BUCKET/$BRANCH/"

    # If the branch name matches ROOT_BRANCH, it also gets copied to the root
    if [[ "$BRANCH" == "$ROOT_BRANCH" ]]; then
        echo "Copying $PWD/release/* to gs://$STAGING_BUCKET/"
        gsutil -m cp -r -a public-read -z js,css,html "$PWD/build/release/*" "gs://$STAGING_BUCKET/"
    fi

fi
