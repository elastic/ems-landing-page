# Contributing to Elastic Maps Service Landing Page

## New features and bug fixes
All pull requests must be targeted to the `master` branch.

If multiple releases are affected:

1. Open a PR against the `master` branch.
1. After the PR is merged, use the [backport tool](https://github.com/sqren/backport) to to generate a backport PR for the affected branches.
1. After all PRs to release branches have been merged and their [respective Jenkins jobs](https://kibana-ci.elastic.co) (ex. elastic / ems-landing-page # v7.2 - stage) have completed successfully review the staged changes at https://maps-staging.elastic.co/{some-release-branch} (ex. [7.2](https://maps-staging.elastic.co/v7.2)).
1. If the staged changes are ok, deploy the changes to production by logging into [this Jenkins job](https://kibana-ci.elastic.co/job/elastic+ems-landing-page+deploy/) and choose "Build with Parameters".

## New Releases
New releases of EMS Landing Page match minor releases of the Elastic Stack.

To add a new release:
1. Create a new release branch from the `master` branch.
1. Create a new config in the [.ci/jobs](https://github.com/elastic/ems-landing-page/tree/master/.ci/jobs) directory for the new release branch.

After release:
1. Open a PR to change the [default `root_branch`](https://github.com/elastic/ems-landing-page/blob/master/.ci/jobs/defaults.yml#L22) to the current release branch (ex. v7.4).
1. Then log into [this Jenkins job](https://kibana-ci.elastic.co/job/elastic+ems-landing-page+deploy/) and choose "Build with Parameters". You may have to change the `root_branch` parameter to the current release. This will update https://maps.elastic.co to the current release.
