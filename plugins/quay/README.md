# Quay plugin for Backstage

The Quay plugin displays the information about your container images within the Quay registry.

## Using Quay plugin

1. Install the Quay plugin using the following command:

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-quay
   ```

2. Set the proxy to the desired Quay server in the `app-config.yaml` file as follows:

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
   ```

3. Enable an additional tab on the entity view page:

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

4. Annotate your entity with the following annotations:

   ```yaml
   metadata:
     annotations:
       'quay.io/repository-slug': `<ORGANIZATION>/<REPOSITORY>',
   ```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Quay plugin is a frontend plugin. However, it requires a backend proxy to be available at all times. Therefore, you need to run a backend instance in the development environment as well.

You can run the following commands concurrently from the root repository to start a live development session:

```
yarn start-backend
```

```
yarn workspace @janus-idp/backstage-plugin-quay run start
```
