# Jfrog Artifactory plugin for Backstage

This plugin will show you information about your container images within Jfrog Artifactory registry

## Installation

Run the following command to install the Jfrog Artifactory plugin:

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
     isJfrogArtifactoryAvailable,
     JfrogArtifactoryPage,
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
