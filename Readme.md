# pulumi-brum-js

This is an example repository to showcase the powers of Pulumi for Infrastructure as Code (IaC) from a recent tech talk.

## Running repository

1. Ensure you have installed Pulumi
   - `brew install pulumi`
   - Or [see installation guide](https://www.pulumi.com/docs/get-started/install/)
2. Install `gcloud` locally ([here](https://cloud.google.com/sdk/docs/install))
3. `gcloud auth application-default login`
4. `gcloud config set project <YOUR_PROJECT_ID>`
5. `pulumi config set gcp:project <YOUR_PROJECT_ID>`
6. `pulumi config set --secret dbPassword <YOUR_DB_PASSWORD>`
7. `pulumi up`

## Switching stacks

If you want to test out the "local stack" which runs Postgres as a docker container, you can do so by:

1. `pulumi stack switch dev`
2. `pulumi config set --secret dbPassword <YOUR_DEV_DB_PASSWORD>`
3. `pulumi up`

## Continuous Integration

If you fork this repository, you will have to set 3 secrets in order for the PR Preview workflow to work:

1. `PULUMI_ACCESS_TOKEN`
2. `GCP_CREDENTIALS`
3. `GITHUB_TOKEN`
