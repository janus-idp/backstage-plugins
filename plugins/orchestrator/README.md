# Orchestrator Plugin for Backstage

The Orchestrator for Backstage is a mechanism designed to facilitate the implementation and execution of developer self-service flows. It serves as a vital component that enhances and augments the existing scaffolder functionality of Backstage with a more flexible and powerful set of features including long-running and asynchronous flows.

The orchestrator works harmoniously with other Backstage components such as the Software Catalog, permissions, and plugins as well as others. By leveraging its capabilities, organizations can orchestrate and coordinate developer self-service flows effectively.

## Context

The Backstage Orchestrator plugin aims to provide a better option to Scaffolder, based on workflows to have a more flexible and powerful tool that addresses the need by streamlining and automating processes, allowing developers to focus more on coding and innovation.

The orchestrator relies on [SonataFlow](https://sonataflow.org/), a powerful tool for building cloud-native workflow applications.

The main idea is to keep the same user experience for users, levering the UI components, input forms, and flow that Scaffolder provides, this way it should be straightforward for users and transparent no matter whether using Templates or Workflows, both can live together being compatible with integration points.

The orchestrator controls the flow orchestrating operations/tasks that may be executed in any external service including Scaffolder Actions, this way it is possible to leverage any existing Action hence Templates and GPT can be easily migrated to workflows opening the door to extend them to more complex use cases.

## Capabilities

**Advanced core capabilities**

- Stateful/long-lived
- Branching and parallelism
- Error management and compensation
- Event-driven supporting [CloudEvents](https://cloudevents.io)
- Audit logging
- Sub-flows
- Choreography
- Timer/timeout control
- Built-in powerful expression evaluation with JQ
- Low Code/Node code
- Cloud-native architecture Kubernetes/Openshit with Operator support
- OpenAPI / REST built-in integration etc.

**Client-side tooling**

- Orchestration visualization / graphical editor
- Integration with service catalog/actions
- GitHub integration
- Form generation
- Runtime monitoring of instances
- Dashboards
- Potential custom integrations (user interaction, notifications, etc.)

## For administrators

### Installation

The Orchestrator plugin is composed of the following packages:

- `@janus-idp/backstage-plugin-orchestrator-backend` package connects the Backstage server to the Orchestrator. For setup process, see [Backend Setup](#setting-up-the-orchestrator-backend-package)
- `@janus-idp/backstage-plugin-orchestrator` package contains frontend components for the Orchestrator plugin. For setup process, see [Frontend Setup](#setting-up-the-orchestrator-frontend-package)
- `@janus-idp/backstage-plugin-orchestrator-common` package contains shared code between the Orchestrator plugin packages.
- `@janus-idp/backstage-plugin-catalog-backend-module-orchestrator-entity-provider` package is a backend module to the catalog plugin to build the Orchestrator entity provider.

#### Prerequisites

- Docker up and running (currently it is a limitation, see [Limitations](#limitations))

#### Setting up the configuration for the Orchestrator plugin

The following configuration is required for the Orchestrator plugin to work properly:

```yaml title="app-config.yaml"
orchestrator:
  sonataFlowService:
    baseUrl: http://localhost
    port: 8899
    path: ../../plugins/orchestrator-backend/workflows
```

For more information about the configuration options, including other optional properties, see the [config.d.ts](../orchestrator-common/config.d.ts) file.

- Although optional, you may also want to set up the `GITHUB_TOKEN` environment variable to allow the Orchestrator to access the GitHub API.

#### Setting up the Orchestrator backend package

1. Install the Orchestrator backend plugin using the following command:

   ```console
   yarn workspace backend add @janus-idp/backstage-plugin-orchestrator-backend
   ```

1. Create a new plugin instance in `packages/backend/src/plugins/orchestrator.ts` file:

   ```ts title="packages/backend/src/plugins/orchestrator.ts"
   import { Router } from 'express';

   import { createRouter } from '@janus-idp/backstage-plugin-orchestrator-backend';

   import { PluginEnvironment } from '../types';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     return await createRouter({
       eventBroker: env.eventBroker,
       config: env.config,
       logger: env.logger,
       discovery: env.discovery,
       catalogApi: env.catalogApi,
       urlReader: env.reader,
     });
   }
   ```

1. Import and plug the new instance into `packages/backend/src/index.ts` file:

   ```ts title="packages/backend/src/index.ts"
   /* highlight-add-next-line */
   import orchestrator from './plugins/orchestrator';

   async function main() {
     // ...
     const createEnv = makeCreateEnv(config);
     // ...
     /* highlight-add-next-line */
     const orchestratorEnv = useHotMemoize(module, () =>
       createEnv('orchestrator'),
     );
     // ...
     const apiRouter = Router();
     // ...
     /* highlight-add-next-line */
     apiRouter.use('/orchestrator', await orchestrator(orchestratorEnv));
     // ...
   }
   ```

#### Setting up the Orchestrator frontend package

1. Install the Orchestrator frontend plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-orchestrator
   ```

1. Add a route to the `OrchestratorPage` to Backstage App (`packages/app/src/App.tsx`):

   ```tsx title="packages/app/src/App.tsx"
   /* highlight-add-next-line */
   import { OrchestratorPage } from '@janus-idp/backstage-plugin-orchestrator';

   const routes = (
     <FlatRoutes>
       {/* ... */}
       {/* highlight-add-next-line */}
       <Route path="/orchestrator" element={<OrchestratorPage />} />
     </FlatRoutes>
   );
   ```

1. Add the Orchestrator to Backstage side bar (`packages/app/src/components/Root/Root.tsx`):

   ```tsx title="packages/app/src/components/Root/Root.tsx"
   /* highlight-add-next-line */
   import WorkflowIcon from '@material-ui/icons/Receipt';

   export const Root = ({ children }: PropsWithChildren<{}>) => (
     <SidebarPage>
       <Sidebar>
         <SidebarGroup label="Menu" icon={<MenuIcon />}>
           {/* ... */}
           {/* highlight-add-next-line */}
           <SidebarItem
             icon={WorkflowIcon}
             to="orchestrator"
             text="Workflows"
           />
         </SidebarGroup>
         {/* ... */}
       </Sidebar>
       {children}
     </SidebarPage>
   );
   ```

## For users

### Using the Orchestrator plugin in Backstage

The Orchestrator plugin enhances the Backstage with the execution of developer self-service flows. It provides a graphical editor to manage workflows, and a dashboard to monitor the execution of the workflows.

#### Prerequisites

- Your Backstage application is installed and running.
- You have installed the Orchestrator plugin. For the installation process, see [Installation](#installation).

#### Procedure

1. Open your Backstage application.
1. Click the **Workflows** tab from the left-side panel to navigate to the **Orchestrator** main page.
1. Inside the **Orchestrator** main page, you can see the list of workflows that are available in your Backstage application.

## Limitations

1. The plugin architecture relies on the SonataFlow Dev Mode image locally running in the host machine. This is currently needed to map local workflow definition files to the container. This limitation will be removed in the future.
1. The integration with Scaffolder component catalog only works if the new backend system from Backstage is used.
