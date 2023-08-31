# Ansible Automation Platform Backstage provider plugin

The Ansible Automation Platform (AAP) Backstage provider plugin synchronizes the AAP content including job templates into the [Backstage](https://backstage.io/) catalog.

## For administrators

### Installation and configuration

The AAP Backstage provider plugin allows the configuration of one or multiple providers using the `app-config.yaml` configuration file of Backstage.

#### Procedure

1. Run the following command to install the AAP Backstage provider plugin:

   ```console
   yarn workspace backend add @janus-idp/backstage-plugin-aap-backend
   ```

1. Use `aap` marker to configure the `app-config.yaml` file of Backstage as follows:

   ```yaml title="app-config.yaml"
   catalog:
     providers:
       aap:
         dev:
           baseUrl: <URL>
           authorization: 'Bearer ${AAP_AUTH_TOKEN}'
           owner: <owner>
           system: <system>
           schedule: # optional; same options as in TaskScheduleDefinition
             # supports cron, ISO duration, "human duration" as used in code
             frequency: { minutes: 1 }
             # supports ISO duration, "human duration" as used in code
             timeout: { minutes: 1 }
   ```

1. Configure the scheduler using one of the following options:

   - Add the following code to the `packages/backend/src/plugins/catalog.ts` file if the scheduler is configured inside the `app-config.yaml` file:

     ```ts title="packages/backend/src/plugins/catalog.ts"
     /* highlight-add-next-line */
     import { AapResourceEntityProvider } from '@janus-idp/backstage-plugin-aap-backend';

     export default async function createPlugin(
       env: PluginEnvironment,
     ): Promise<Router> {
       const builder = await CatalogBuilder.create(env);

       /* ... other processors and/or providers ... */
       /* highlight-add-start */
       builder.addEntityProvider(
         AapResourceEntityProvider.fromConfig(env.config, {
           logger: env.logger,
           scheduler: env.scheduler,
         }),
       );
       /* highlight-add-end */

       const { processingEngine, router } = await builder.build();
       await processingEngine.start();
       return router;
     }
     ```

   - Add a schedule directly inside the `packages/backend/src/plugins/catalog.ts` file as follows:

     ```ts title="packages/backend/src/plugins/catalog.ts"
     /* highlight-add-next-line */
     import { AapResourceEntityProvider } from '@janus-idp/backstage-plugin-aap-backend';

     export default async function createPlugin(
       env: PluginEnvironment,
     ): Promise<Router> {
       const builder = await CatalogBuilder.create(env);

       /* ... other processors and/or providers ... */
       /* highlight-add-start */
       builder.addEntityProvider(
         AapResourceEntityProvider.fromConfig(env.config, {
           logger: env.logger,
           schedule: env.scheduler.createScheduledTaskRunner({
             frequency: { minutes: 1 },
             timeout: { minutes: 1 },
           }),
         }),
       );
       /* highlight-add-end */

       const { processingEngine, router } = await builder.build();
       await processingEngine.start();
       return router;
     }
     ```

### Troubleshooting

When you start your Backstage application, you can see the following log lines:

```log
[1] 2023-02-13T15:26:09.356Z catalog info Discovered ResourceEntity API type=plugin target=AapResourceEntityProvider:dev
[1] 2023-02-13T15:26:09.423Z catalog info Discovered ResourceEntity Red Hat Event (DEV, v1.2.0) type=plugin target=AapResourceEntityProvider:dev
[1] 2023-02-13T15:26:09.620Z catalog info Discovered ResourceEntity Red Hat Event (TEST, v1.1.0) type=plugin target=AapResourceEntityProvider:dev
[1] 2023-02-13T15:26:09.819Z catalog info Discovered ResourceEntity Red Hat Event (PROD, v1.1.0) type=plugin target=AapResourceEntityProvider:dev
[1] 2023-02-13T15:26:09.819Z catalog info Applying the mutation with 3 entities type=plugin target=AapResourceEntityProvider:dev
```

## For users

### Accessing job templates from Ansible Automation Platform in Backstage

Once the AAP Backstage provider plugin is configured successfully, it synchronizes the job templates from AAP and displays them in the Backstage Catalog page as Resources.

#### Prerequisites

- Your Backstage application is installed and running.
- You have installed the AAP Backstage provider plugin. For installation and configuration instructions, see [Installation and configuration](#installation-and-configuration).

#### Procedure

1. Open your Backstage application and Go to the **Catalog** page.
1. Select **Resource** from the **Kind** drop-down and **job_template** from the **Type** drop-down on the left side of the page.

   ![aap-backend-plugin-backstage](./images/aap-backend-plugin-user1.png)

   A list of all the available job templates from AAP appears on the page.

   **NOTE**: The imported job templates from AAP in Backstage follow the `{jobTemplateName}-{orgName}-{envNameInConfig}` naming syntax without white spaces. For example, in the Demo_Job_Template-Default-Stage, Demo_Job_Template is `jobTemplateName`, Default is `orgName`, and Stage is `envNameInConfig`.

1. Select a job template from the list.

   The **OVERVIEW** tab appears containing different cards, such as:

   - **About**: Provides detailed information about the job template.
   - **Relations**: Displays the visual representation of the job template and associated aspects.
   - **Links**: Contains links to the AAP dashboard and the details page of the job template.
   - **Has subcomponents**: Displays a list of associated subcomponents.

     ![aap-backend-plugin-backstage-details](./images/aap-backend-plugin-user2.png)
