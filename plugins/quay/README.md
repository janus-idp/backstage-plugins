# Quay plugin for Backstage

This plugin will show you information about your container images within Quay registry

## Getting started

1. Install the plugin

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-quay
   ```

2. Set the proxy to desired Quay server

   ```yaml
   # app-config.yaml
   proxy:
     '/quay/api':
       target: 'https://quay.io'
       headers:
         X-Requested-With: 'XMLHttpRequest'
         # Uncomment the following line to access a private Quay Repository using a token
         # Authorization: 'Bearer <YOUR TOKEN>'
       changeOrigin: true
       # Change to "false" in case of using self hosted quay instance with a self-signed certificate
       secure: true

   quay:
     # The UI url for Quay, used to generate the link to Quay
     uiUrl: 'https://quay.io'
   ```

3. Enable additional tab on the entity view page

   ```ts
   // packages/app/src/components/catalog/EntityPage.tsx
   import { QuayPage, isQuayAvailable } from '@janus-idp/backstage-plugin-quay';

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

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. However it requires backend proxy to be available at all times. Development environment therefore requires you to run a backend instance as well. You can start a live dev session from the repository root using following commands concurrently:

```
yarn start-backend
```

```
yarn workspace @janus-idp/backstage-plugin-quay run start
```
