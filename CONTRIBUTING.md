# Contributing to Elastic Maps Service Landing Page

## New features and bug fixes

All pull requests must be targeted to the `master` branch.

If multiple releases are affected:

1. Open a PR against the `master` branch.
1. After the PR is merged, [Backport](#Backporting) the commit(s) to the affected branches.
1. After all PRs to release branches have been merged and their corresponding Buildkite pipeline executions have completed successfully review the staged changes at https://maps-staging.elastic.co/{some-release-branch} (ex. [7.2](https://maps-staging.elastic.co/v7.2)).
1. If the staged changes are OK, deploy the changes to production by pushing tags to `master` and the affected release branches and accept the deployment block steps at the corresponding buildkite pipeline executions.

## New Releases

New releases of EMS Landing Page match minor releases of the Elastic Stack.

To add a new release:
1. Open a PR with the following changes:
    1. Change the `EMS_VERSION` in config.json.
    1. Upgrade the `@elastic/ems-client` dependency, if necessary.
    1. Bump the version in `package.json`.
    1. Update `.backportrc.json` adding the new release and removing any inactive branch.
1. After the PR is merged, create the new release branch from the `master` branch.

After release:

1. Open a PR to change the [default `root_branch`](https://github.com/elastic/ems-landing-page/blob/c57d15ab7550a8b7e3be639e32743cce95c6994b/.buildkite/hooks/pre-command#L54) to the current release branch (ex. v7.4).
1. After merging the PR, [backport](#Backporting) the commit to all active branches.
1. Create a new tag on the release branch to trigger a production deployment.
1. Add the new release branch to the Snyk project.

## Backporting

Commits can be backported to previous branches using the [backport](https://github.com/sqren/backport) tool. Backport automatically applies the commit to the selected branches and opens pull requests. It may be necessary to backport bug fixes and dependency upgrades to multiple branches.

Backporting can also introduce merge conflicts which must be resolved before continuing. Due to our current lack of automated tests, backport PRs should be tested locally before merging.
