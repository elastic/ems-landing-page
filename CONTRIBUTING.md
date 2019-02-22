# Contributing to Elastic Maps Service Landing Page

## Bug fixes
Pull requests for bug fixes must be targeted to the affected release branch. 

If multiple releases are affected, please target the PR to the oldest affected release branch first. After the bugfix PR is merged, open PRs from the fixed branch targeting the next branch. Continue opening PRs and merging until the fix is deployed to all affected release branches.

### Example

For example, a bug is found that affects the 6.6, 6.7, and 7.0 releases. The current production release is 6.7. 

If necessary, create a fork of the ems-landing-page. Then clone your fork.
```
git clone https://github.com/{username}/ems-landing-page.git
cd ems-landing-page
```

Add the original ems-landing-page as a remote called `upstream`.
```
git remote add upstream https://github.com/elastic/ems-landing-page.git
```

Since the oldest affected release is 6.6, create a new branch from that release in your fork of ems-landing-page.
```
git checkout v6.6 upstream/v6.6
git checkout -b bugfix-v6.6
```

Make your changes to the code then commit and push to your repo.
``` 
git add <my-files>
git commit -m <my helpful commit message>
git push -u origin bugfix-v6.6
```

Open a Pull Request targeting the `v6.6` branch of https://github.com/elastic/ems-landing-page and ask for a review.

After the PR is reviewed and merged, open another PR from the `v6.6` branch targeting `v6.7`. 

After the PR is merged to `v6.7` open a PR from `v6.7` branch targeting `v7.0`. 

Since 6.7 is the latest release, we need to update `master` from the `v6.7`  branch. So open a PR from `v6.7` branch targeting `master`.

## New Feature
Pull requests for new features should target only branch releases that are not yet in production. So, if 6.7 is the latest production release, all new features should target the `v7.0` branch or later.

## New Releases
New releases of EMS Landing Page match minor releases of the Elastic Stack. To add a new release, create a new release branch from the previous branch. 

New release branches must also be added to [Jenkins](https://kibana-ci.elastic.co/) for continuous integration and deployment.

Release branches can be published and pushed to production prior to stack release for development and testing. However, new release branches should only be merged with the `master` branch immediately prior to the stack release. This ensures that https://maps.elastic.co matches the current production release.

### Example

For example, if 7.1 is the next minor stack release, a new `v7.1` branch should be created from the `v7.0` branch. 

Immediately prior to or on the day of the 7.1 stack release, a PR should be opened from the `v7.1` branch to `master`. Jenkins should also be [manually triggered](https://kibana-ci.elastic.co/job/elastic+ems-landing-page+deploy/) to deploy the releases to production.






