# Contributing to Elastic Maps Service Landing Page

## New features and bug fixes

All pull requests must be targeted to the `master` branch.

If multiple releases are affected:

1. Open a PR against the `master` branch.
1. After the PR is merged, [Backport](#Backporting) the commit(s) to the affected branches.
1. After all PRs to release branches have been merged and their corresponding Buildkite pipeline executions have completed successfully review the staged changes at `https://maps-staging.elastic.co/{some-release-branch}` (ex. [7.2](https://maps-staging.elastic.co/v7.2)).

## New Releases

New releases of EMS Landing Page match minor releases of the Elastic Stack.

To add a new release:
1. Open a PR with the following changes:
    1. Change the `EMS_VERSION` in config.json.
    1. Upgrade the `@elastic/ems-client` dependency, if necessary.
    1. Bump the version in `package.json`.
    1. Update `.backportrc.json` adding the new release and removing any inactive branch.
1. After the PR is merged, create the new release branch from the `master` branch.
1. Check in staging that the new branch is deployed
1. Add the new release branch to the Snyk project.
1. Deploy the branch (next section)

## Deployment to production

Deploy the changes to production by doing the following steps per each affected branch (including `master`):

1. Checkout the release branch (say `v8.9`)
1. Create a tag with the pattern `branch-date` (`master-2023-07-25`, `v8.9-2023-07-25`)
1. Push it to the Elastic remote `git push --tags`
1. A new deploy job will be triggered in Buildkite with a blocking step that needs to be accepted by a member of the team
1. Wait for the job to finish and review the changes in production at <https://maps.elastic.co>` or `https://maps.elastic.co/{some-release-branch}/` (ex. [7.2](https://maps.elastic.co/v7.2))

**Note**: The Buildkite deploy job does not take any assets from staging. It builds all the assets from the source code and syncs with the production bucket, removing old assets if necessary.

## Backporting

Commits can be backported to previous branches using the [backport](https://github.com/sqren/backport) tool. Backport automatically applies the commit to the selected branches and opens pull requests. It may be necessary to backport bug fixes and dependency upgrades to multiple branches.

Backporting can also introduce merge conflicts which must be resolved before continuing. Due to our current lack of automated tests, backport PRs should be tested locally before merging.
