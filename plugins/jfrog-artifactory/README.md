# Artifactory plugin for Backstage

This plugin will show you information about your container images within Artifactory registry

## Getting started

1. Install the plugin

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-artifactory
   ```

2. Set the proxy to desired Artifactory server

   ```yaml
   # app-config.yaml
   proxy:
     '/artifactory/api':
       target: 'http://<hostname>:8082'
       headers:
         # Authorization: 'Bearer <YOUR TOKEN>'
       # Change to "false" in case of using self hosted artifactory instance with a self-signed certificate
       secure: true
   ```

3. Enable additional tab on the entity view page

   ```ts
   // packages/app/src/components/catalog/EntityPage.tsx
   import {
     ArtifactoryPage,
     isArtifactoryAvailable,
   } from '@janus-idp/backstage-plugin-artifactory';

   const serviceEntityPage = (
     <EntityPageLayout>
       // ...
       <EntityLayout.Route
         if={isArtifactoryAvailable}
         path="/artifactory"
         title="Artifactory"
       >
         <ArtifactoryPage />
       </EntityLayout.Route>
     </EntityPageLayout>
   );
   ```

4. Annotate your entity with

   ```yaml
   metadata:
     annotations:
       'artifactory/image-name': `<IMAGE-NAME>',
   ```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. However it requires backend proxy to be available at all times. Development environment therefore requires you to run a backend instance as well. You can start a live dev session from the repository root using following commands concurrently:

```
yarn start-backend
```

```
yarn workspace @janus-idp/backstage-plugin-artifactory run start
```
