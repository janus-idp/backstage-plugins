# Azure Container Registry plugin for Backstage

This plugin will show you information about your container images within Azure Container Registry

## Getting started

### 1. Install the plugin

```bash
yarn workspace app add @janus-idp/plugin-acr
```

### 2. Set the proxy to desired Azure Container Registry server

```yaml
# app-config.yaml
proxy:
  '/acr/api':
    target: 'https://mycontainerregistry.azurecr.io/acr/v1/'
    changeOrigin: true
    headers:
      # If you use Bearer Token for authorization, please replace the 'Basic' with 'Bearer' in the following line.
      Authorization: 'Basic ${ACR_AUTH_TOKEN}'
    # Change to "false" in case of using self hosted artifactory instance with a self-signed certificate
    secure: true
```

### 3. Authorization.

Basic Authorization: Go to your Azure Container Registry portal, and go to the `Access Keys` tab. Get the `username` and the `password` of the `Admin User`, and use this [tool](https://www.debugbear.com/basic-auth-header-generator) to covert them into a token, and make it as the `ACR_AUTH_TOKEN` in environment variables.

OAuth2: You can following the [link](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication?tabs=azure-cli) to get the bearer access token, and make it as `ACR_AUTH_TOKEN`.

### 4. Enable additional tab on the entity view page

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { AcrPage, isAcrAvailable } from '@janus-idp/plugin-acr';

const websiteEntityPage = (
  <EntityPageLayout>
    // ...
    <EntityLayout.Route path="/acr" title="ACR">
      <Grid container spacing={3} alignItems="stretch">
        <EntitySwitch>
          <EntitySwitch.Case if={e => Boolean(isAcrAvailable(e))}>
            <Grid item sm={12}>
              <AcrPage />
            </Grid>
          </EntitySwitch.Case>
        </EntitySwitch>
      </Grid>
    </EntityLayout.Route>
  </EntityPageLayout>
);
```

### 5. Annotate your entity with

```yaml
metadata:
  annotations:
    'azure-container-registry/repository-name': `<REPOSITORY-NAME>',
```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. However it requires backend proxy to be available at all times. Development environment therefore requires you to run a backend instance as well. You can start a live dev session from the repository root using following commands concurrently:

```
yarn start-backend
```

Go to the root repository and run:

```
yarn start
```
