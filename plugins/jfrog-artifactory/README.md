# Jfrog Artifactory plugin for Backstage

This plugin will show you information about your container images within Jfrog Artifactory registry

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Development Setup](#development-setup)

## Installation

1. Install the plugin

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-jfrog-artifactory
   ```

## Configuration

1. Set the proxy to desired Artifactory server in `app-config.yaml`

   ```yaml title="app-config.yaml"
   proxy:
     '/jfrog-artifactory/api':
       target: 'http://<hostname>:8082'
       headers:
         # Authorization: 'Bearer <YOUR TOKEN>'
       # Change to "false" in case of using self hosted artifactory instance with a self-signed certificate
       secure: true
   ```

2. Enable additional tab on the entity view page in `packages/app/src/components/catalog/EntityPage.tsx`

   ```ts title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-start */
   import {
     JfrogArtifactoryPage,
     isJfrogArtifactoryAvailable,
   } from '@janus-idp/backstage-plugin-jfrog-artifactory';
   /* highlight-add-end */

   const serviceEntityPage = (
     <EntityPageLayout>
       // ...
       {/* highlight-add-start */}
       <EntityLayout.Route
         if={isJfrogArtifactoryAvailable}
         path="/jfrog-artifactory"
         title="Jfrog Artifactory"
       >
         <JfrogArtifactoryPage />
       </EntityLayout.Route>
       {/* highlight-add-end */}
     </EntityPageLayout>
   );
   ```

3. Annotate your entity with

   ```yaml title="catalog-info.yaml"
   metadata:
     annotations:
       'jfrog-artifactory/image-name': `<IMAGE-NAME>',
   ```

## Development Setup

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. However it requires backend proxy to be available at all times. Development environment therefore requires you to run a backend instance as well. You can start a live dev session from the repository root using following commands concurrently:

```console
yarn start-backend
```

```console
yarn workspace @janus-idp/backstage-plugin-jfrog-artifactory run start
```
