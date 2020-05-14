# Contributing to Elastic Maps Service Landing Page

## New features and bug fixes
All pull requests must be targeted to the `master` branch.

If multiple releases are affected:

1. Open a PR against the `master` branch.
1. After the PR is merged, [Backport](#Backporting) the commit(s) to the affected branches.
1. After all PRs to release branches have been merged and their [respective Jenkins jobs](https://kibana-ci.elastic.co) (ex. elastic / ems-landing-page # v7.2 - stage) have completed successfully review the staged changes at https://maps-staging.elastic.co/{some-release-branch} (ex. [7.2](https://maps-staging.elastic.co/v7.2)).
1. If the staged changes are ok, deploy the changes to production by logging into [this Jenkins job](https://kibana-ci.elastic.co/job/elastic+ems-landing-page+deploy/) and choose "Build with Parameters".

## New Releases
New releases of EMS Landing Page match minor releases of the Elastic Stack.

To add a new release:
1. Create a new config in the [.ci/jobs](https://github.com/elastic/ems-landing-page/tree/master/.ci/jobs) directory for a new release branch on the `master` branch.
1. Change the EMS_VERSION in config.json.
1. Upgrade the ems-client dependency.
1. Bump the verison in package.json.
1. Create the new release branch from the `master` branch.

After release:
1. Open a PR to change the [default `root_branch`](https://github.com/elastic/ems-landing-page/blob/master/.ci/jobs/defaults.yml#L22) to the current release branch (ex. v7.4).
1. After merging the PR, [backport](#Backporting) the commit to the respective release branch and merge.
1. Wait for the elastic+ems-landing-page+jjbb Jenkins job to update.
1. Then log into [this Jenkins job](https://kibana-ci.elastic.co/job/elastic+ems-landing-page+deploy/) and choose "Build with Parameters". This will update https://maps.elastic.co to the current release.

## Backporting

Commits can be backported to previous branches using the [backport](https://github.com/sqren/backport) tool. Backport automatically applies the commit to the selected branches and opens pull requests. It may be necessary to backport bug fixes and dependency upgrades to multiple branches.

Backporting can also introduce merge conflicts which must be resolved before continuing. Due to our current lack of automated tests, backport PRs should be tested locally before merging.
