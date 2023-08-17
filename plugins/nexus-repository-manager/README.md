# Nexus Repository Manager plugin for Backstage

The Nexus Repository Manager plugin displays the information about your build artifacts within the Nexus Repository Manager in your Backstage application.

## For administrators

### Installation

1. Install the Nexus Repository Manager plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-nexus-repository-manager
   ```

### Configuration

1. Set the proxy to the desired Nexus Repository Manager server in the `app-config.yaml` file as follows:

   ```yaml title="app-config.yaml"
   proxy:
     '/nexus-repository-manager':
       target: 'https://<NEXUS_REPOSITORY_MANAGER_URL>'
       headers:
         X-Requested-With: 'XMLHttpRequest'
         # Uncomment the following line to access a private Nexus Repository Manager using a token
         # Authorization: 'Bearer <YOUR TOKEN>'
       changeOrigin: true
       # Change to "false" in case of using self hosted Nexus Repository Manager instance with a self-signed certificate
       secure: true
   ```

2. Optional: Change the base url of Nexus Repository Manager proxy.

   ```yaml title="app-config.yaml"
   nexusRepositoryManager:
     # default path is `/nexus-repository-manager`
     proxyPath: /custom-path
   ```

3. Optional: Enable experimental annotations. Note, these have not been thoroughly tested.

   ```yaml title="app-config.yaml"
   nexusRepositoryManager:
     experimentalAnnotations: true
   ```

   Replace the `isNexusRepositoryAvailable` import with `isNexusRepositoryManagerExperimentalAvailable` when adding the `<NexusRepositoryManagerPage />` component.

4. Enable an additional tab on the entity view page in `packages/app/src/components/catalog/EntityPage.tsx`:

   ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-next-line */
   import {
     isNexusRepositoryManagerAvailable,
     NexusRepositoryManagerPage,
   } from '@janus-idp/backstage-plugin-nexus-repository-manager';

   const serviceEntityPage = (
     <EntityPageLayout>
       {/* ... */}
       {/* highlight-add-next-line */}
       <EntityLayout.Route
         if={isNexusRepositoryAvailable}
         path="/build-artifacts"
         title="Build Artifacts"
       >
         <NexusRepositoryManagerPage />
       </EntityLayout.Route>
     </EntityPageLayout>
   );
   ```

5. Annotate your entity with any of the following annotations:

   ```yaml title="catalog-info.yaml"
   metadata:
     annotations:
       # insert the chosen annotations here
       # example
       nexus-repository-manager/docker.image-name: `<ORGANIZATION>/<REPOSITORY>`,
   ```

   More annotations can be found [here](./ANNOTATIONS.md).

## For users

### Using the Nexus Repository Manager plugin in Backstage

The Nexus Repository Manager is a front-end plugin that enables you to view the information about build artifacts.

#### Prerequisites

- Your Backstage application is installed and running.
- You have installed the Nexus Repository Manager plugin. For installation process, see [Installation](#installation).

#### Procedure

1. Open your Backstage application and select a component from the **Catalog** page.
2. Go to the **Build Artifacts** tab.

   The **Image Registry** tab in the Backstage UI contains a list of build artifacts and related information, such as **VERSION**, **REPOSITORY**, **Repository Type**, **MANIFEST**, **MODIFIED**, and **SIZE**.

   ![nexus-repository-manager-tab](./images/nexus-repository-manager.png)
