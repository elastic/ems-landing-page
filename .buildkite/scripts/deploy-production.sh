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

if [[ -z "${PRODUCTION_BUCKET}" ]]; then
    echo "--- :fire:  PRODUCTION_BUCKET is not set, e.g. 'PRODUCTION_BUCKET=elastic-ems-dev-maps-landing-page-live'" 1>&2
    exit 1
fi

if [[ -z "${ARCHIVE_BUCKET}" ]]; then
    echo "--- :fire:  ARCHIVE_BUCKET is not set, e.g. 'ARCHIVE_BUCKET=elastic-ems-dev-maps-landing-page-staging'" 1>&2
    exit 1
fi


TIMESTAMP=`date +"%Y-%m-%d_%H-%M-%S"`
SNAPSHOT_DIR=$PWD/${TIMESTAMP}_snapshot
ZIP_FILE=${TIMESTAMP}_ems_landingpages.tar.gz
ZIP_FILE_PATH=$PWD/$ZIP_FILE

echo "--- :arrow_down: Copying gs://$STAGING_BUCKET to $SNAPSHOT_DIR"
if [[ -d "$SNAPSHOT_DIR" ]]; then
    echo ":fire: $SNAPSHOT_DIR already exist" 1>&2
    exit 1
fi
mkdir -p "$SNAPSHOT_DIR"
gsutil -m cp -r "gs://$STAGING_BUCKET/*" "$SNAPSHOT_DIR"


echo "--- :compression: Archiving assets into $ZIP_FILE_PATH"
tar -czvf "$ZIP_FILE_PATH" -C "$SNAPSHOT_DIR" .

set +e
if gsutil -q stat "gs://$ARCHIVE_BUCKET/$ZIP_FILE" ; then
    echo "--- :fire: ERROR: snapshot file \"gs://$ARCHIVE_BUCKET/$ZIP_FILE\" already exists" 1>&2
    exit 1
fi
set -e

echo "--- :file_cabinet: Copying $ZIP_FILE_PATH snapshot to gs://$ARCHIVE_BUCKET"
gsutil cp "$ZIP_FILE_PATH" "gs://$ARCHIVE_BUCKET"

set +e
if ! gsutil -q stat "gs://$ARCHIVE_BUCKET/$ZIP_FILE" ; then
    echo ":fire: ERROR: snapshot file \"gs://$ARCHIVE_BUCKET/$ZIP_FILE\" did not upload successfully" 1>&2
    exit 1
fi
set -e

echo "--- :gcloud: Syncing gs://$STAGING_BUCKET to gs://$PRODUCTION_BUCKET"
gsutil -m rsync -d -r -a public-read "gs://$STAGING_BUCKET" "gs://$PRODUCTION_BUCKET"
