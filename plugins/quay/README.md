# quay-frontend

Welcome to the quay-frontend plugin!
This plugin will show you information about your docker images within quay

_This plugin was created through the Backstage CLI_

## Getting started

### Enabling frontend

1. Install the plugin

   ```bash
   yarn workspace app add @fmenesesg/backstage-plugin-quay
   ```

2. Set the proxy to desired Quay server

   ```yaml
   # app-config.yaml
   proxy:
     '/quay/api':
       target: 'https://quay.io'
       changeOrigin: true
   ```

3. Enable additional tab on the entity view page

   ```ts
   // packages/app/src/components/catalog/EntityPage.tsx
   import { QuayPage, isQuayAvailable } from '@fmenesesg/backstage-plugin-quay';

   const serviceEntityPage = (
     <EntityPageLayout>
       // ...
       <EntityLayout.Route if={isQuayAvailable} path="/quay" title="Quay">
         <QuayPage />
       </EntityLayout.Route>
     </EntityPageLayout>
   );
   ```

4. Annotate your entity with

   ```yaml
   metadata:
     annotations:
       'quay.io/repository-slug': `<ORGANIZATION>/<REPOSITORY>',
   ```
