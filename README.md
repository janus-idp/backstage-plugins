# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn dev
```

## Local development

For local development set the `PARODOS_AUTH_KEY` environment variable to 'Basic dGVzdDp0ZXN0'. This token is base64 encoded string containing `test:test`. You can also use `PARODOS_AUTH_KEY="Basic dGVzdDp0ZXN0" yarn dev` to start development environment with the test token. You can also create an `app-config.local.yaml` file with the following content to automatically include the token.

```yaml
proxy:
  '/parodos':
    headers:
      Authorization: 'Basic dGVzdDp0ZXN0'
```

## Distribution

### NPM Package

To create an NPM package that can be installed via vendored dependencies, run `./scripts/build-orion.sh`. This will generate `success Wrote tarball to "/Users/tarasmankovski/Repositories/red-hat/backstage-orion/plugins/orion/parodos-plugin-orion-v0.1.0.tgz".` which gives you path to the generated `.tgz` file. 


### Docker image

To create a Docker image, run `./scripts/build-image.sh`. This will build a container and tag it with `backstage` you can push this image into the registry. For more information, checkout https://backstage.io/docs/deployment/docker