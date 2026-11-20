# Contributing to Elastic Maps Service Landing Page

## New features and bug fixes

All pull requests must be targeted to the `master` branch.

If multiple releases are affected:

1. Open a PR against the `master` branch.
1. After the PR is merged, [Backport](#Backporting) the commit(s) to the affected branches.
1. After all PRs to release branches have been merged and their corresponding Buildkite pipeline executions have completed successfully review the staged changes at `https://maps-staging.elastic.co/{some-release-branch}` (ex. [7.2](https://maps-staging.elastic.co/v7.2)).

## New Releases

New Stack minors no longer need their own release branch. Clients select the manifest version with the `my_app_version` URL parameter (see the README), and `emsVersion` in `public/config.json` is a date version, so the default build always uses the latest manifest.

Existing release branches (`v9.x` and older) stay in place and keep their fixed `emsVersion`.

When a new version of `@elastic/ems-client` is required, upgrade the dependency in a PR to `master`.

## Deployment to production

Deploy the changes to production by doing the following steps per each affected branch (including `master`):

1. Checkout the release branch (say `v8.9`)
1. Create a tag with the pattern `branch-date` (`master-2023-07-25`, `v8.9-2023-07-25`)
1. Push it to the Elastic remote `git push --tags`
1. A new deploy job will be triggered in Buildkite with a blocking step that needs to be accepted by a member of the team
1. Wait for the job to finish and review the changes in production at <https://maps.elastic.co>` or `https://maps.elastic.co/{some-release-branch}/` (ex. [7.2](https://maps.elastic.co/v7.2))
1. If the site is not yet updated, the CDN cache may need manual invalidation. This applies to all deployed branch paths, including `master` (root) and versioned branches (e.g. `/v9.5/`).

    Invalidate a specific branch:
    ```bash
    BRANCH=v9.5  # or master
    gcloud compute url-maps invalidate-cdn-cache elastic-apps-ems-prod \
      --path "/${BRANCH}/*" \
      --project elastic-ems-prod \
      --global
    ```

    Invalidate everything (root + all branches):
    ```bash
    gcloud compute url-maps invalidate-cdn-cache elastic-apps-ems-prod \
      --path "/*" \
      --project elastic-ems-prod \
      --global
    ```

**Note**: The Buildkite deploy job does not take any assets from staging. It builds all the assets from the source code and syncs with the production bucket, removing old assets if necessary.

## Backporting

Commits can be backported to previous branches using the [backport](https://github.com/sqren/backport) tool. Backport automatically applies the commit to the selected branches and opens pull requests. It may be necessary to backport bug fixes and dependency upgrades to multiple branches.

Backporting can also introduce merge conflicts which must be resolved before continuing. Due to our current lack of automated tests, backport PRs should be tested locally before merging.
