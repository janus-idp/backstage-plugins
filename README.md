# [Backstage](https://backstage.io)

To start the app, run:

```sh
yarn install
yarn dev
```

## Local development

For local development and access to the workflow-service, set the `PARODOS_AUTH_KEY` environment variable to 'Basic dGVzdDp0ZXN0'.
This token is base64 encoded string containing `test:test`.

For the notification-service token, set PARODOS_NOTIFICATION_AUTH_KEY environment variable to 'Basic ZGV2OmRldg==', representing encoded `dev:dev`.

You can also use `PARODOS_AUTH_KEY="Basic dGVzdDp0ZXN0" PARODOS_NOTIFICATION_AUTH_KEY="Basic ZGV2OmRldg==" yarn dev` to start development environment with the test token.
You can also create an `app-config.local.yaml` file with the following content to automatically include the token.

```yaml
proxy:
  '/parodos':
    headers:
      Authorization: 'Basic dGVzdDp0ZXN0'

  '/parodos-notifications':
    headers:
      Authorization: 'Basic ZGV2OmRldg=='
```

## Distribution

### NPM Package

To create an NPM package that can be installed via vendored dependencies, run `./scripts/build-frontend.sh`. This will generate `success Wrote tarball to ".../plugins/parodos/parodos-plugin-parodos-v0.1.0.tgz".` which gives you path to the generated `.tgz` file.

### Docker image

To create a Docker image, run `./scripts/build-image.sh`. This will build a container and tag it with `backstage` you can push this image into the registry. For more information, checkout https://backstage.io/docs/deployment/docker
