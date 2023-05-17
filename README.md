# Elastic Maps Service Landing Page


The Elastic Maps Landing Page is a previewer of the data of the Elastic Maps Service. It allows users to browse the data
that is available within EMS.

## Development

The page is designed as a single-page application. It loads the root manifest from EMS using a cross-domain call. This
is similar to how Kibana retrieves the manifest from EMS.

Please carefully review the `CONTRIBUTING.md` document before submitting any pull requests.

### Prerequisites

`yarn` is used as the dependency manager and script runner for this project. Ensure both `node` and `yarn` are installed on your system.

`webpack` is used for JavaScript transpilation.

To use the recommended node version for running the development and compile tasks, you can use [`nvm`](https://github.com/nvm-sh/nvm) with:

```bash
nvm use
```


### Running the page locally

#### Install dependencies


```bash
yarn install
```

#### Start the babel compilation and watch task


```bash
yarn dev
```

Keep this running. The JavaScript/CSS will be automatically recompiled when files change.

#### Open the page

Open `public/index.html`

You can run the page either from the file-system or any web-server.

## Packaging

To package the app, run the build script.


```bash
yarn build
```

This script will put the relevant resources of the app in the `./build/release/**` folder.

If any intermediate tasks break before packaging, such as a JavaScript linting or compilation failure, the build-script will error out.
Fix the errors, and redeploy.

## Continuous Integration and Deployment

This project is built and deployed at Elastic infrastructure with [buildkite](https://buildkite.com/). All definitions and scripts are stored at the `.buildkite` folder.

* Any new PR will trigger a build that executes `yarn install && yarn build` as defined in `.buildkite/scripts/build.sh`. Any new commit on the PR will trigger a build and the result will be updated in a comment in the pull request.

* When a PR is merged to `master` or a version branch (like `v7.17.` or `v8.8`) the pipeline will run the `build.sh` to generate the website. Then `upload.sh` will be executed to push the contents to a staging Google Cloud bucket. If the branch name coincides with the `ROOT_BRANCH` parameter at the `.buildkite/hooks/pre-command` script, it will also upload the contents to the root folder of the staging bucket.

* Deploying to production works as follows:
  
  * Push a tag from any of the version branches (like `v7.17` or `v8.8`) to start the pipeline execution with the `build.sh` script.
  * A member of the team needs visit the Buildkite pipeline execution website and accept a manual block step to unlock the rest of the pipeline.
  * `archive.sh` will generate a copy of the current production environment and store it in an archive bucket.
  * `upload.sh` will upload the contents to the production environment. If the tag was made on `ROOT_BRANCH` it will also upload the assets to the root folder of the production bucket.

