# Contributing to Elastic Maps Service Landing Page

## New features and bug fixes
Pull requests must be targeted to the `master` branch.

If multiple releases are affected, please open a PR against the `master` branch. After the bugfix PR is merged, use the [backport tool](https://github.com/sqren/backport) to to generate a backport PR for the affected branches.

Jenkins needs to be [manually triggered](https://kibana-ci.elastic.co/job/elastic+ems-landing-page+deploy/) to deploy changes to branches to production.

## New Releases
New releases of EMS Landing Page match minor releases of the Elastic Stack. To add a new release, create a new release branch from the `master` branch.

New release branches must also be added to [Jenkins](https://kibana-ci.elastic.co/) for continuous integration and deployment. Create a new config in the [.ci/jobs](https://github.com/elastic/ems-landing-page/tree/master/.ci/jobs) directory for every new release branch.

After release, change the [default `root_branch`](https://github.com/elastic/ems-landing-page/blob/master/.ci/jobs/defaults.yml#L22) to the current release branch (ex. v7.4). This must be done to update https://maps.elatic.co to the latest release.
