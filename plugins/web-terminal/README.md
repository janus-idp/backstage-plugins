# Web Terminal plugin for Backstage

This plugin provides a frontend for [`webterminal proxy`](https://github.com/janus-idp/webterminal-proxy) and shows a terminal for catalog entities with an Kubernetes API-Server annotation (`kubernetes.io/api-server`).

Users first enter their user token from the cluster, and then the plugin setups environment. Once it is set up, it connects to `webterminal-proxy`, which finishes setups and passes data between the frontend plugin and pod.

This plugin uses [`xterm.js`](http://xtermjs.org/) to simulate a regular terminal.

## Prerequisites

Before we can install this plugin, we need to fulfill the following requirements:

1. Installed [Web Terminal operator](https://docs.openshift.com/container-platform/latest/web_console/web_terminal/installing-web-terminal.html)
2. Deployed [`webterminal-proxy`](https://github.com/janus-idp/webterminal-proxy)

## Installation

1. Install the Web Terminal plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-web-terminal
   ```

2. Enable an additional tab on the entity view page using the `packages/app/src/components/catalog/EntityPage.tsx` file as follows:

   ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-start */
   import {
     isWebTerminalAvailable,
     WebTerminal,
   } from '@janus-idp/backstage-plugin-web-terminal';

   /* highlight-add-end */

   const serviceEntityPage = (
     <EntityLayout>
       // ...
       {/* highlight-add-start */}
       <EntityLayout.Route
         if={isWebTerminalAvailable}
         path="/webterminal"
         title="Web Terminal"
       >
         <WebTerminal />
       </EntityLayout.Route>
       {/* highlight-add-end */}
     </EntityLayout>
   );
   ```

3. Alternative you can add the WebTerminal to an existing page:

   ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-start */
   import {
     isWebTerminalAvailable,
     WebTerminal,
   } from '@janus-idp/backstage-plugin-web-terminal';

   /* highlight-add-end */

   <Grid container spacing={3}>
     {/* highlight-add-start */}
     <EntitySwitch>
       <EntitySwitch.Case if={isWebTerminalAvailable}>
         <Grid item md={6}>
           <WebTerminal />
         </Grid>
       </EntitySwitch.Case>
     </EntitySwitch>
     {/* highlight-add-end */}
   </Grid>;
   ```

4. Annotate your entity using the following annotations:

   ```yaml
   metadata:
     annotations:
       'kubernetes.io/api-server': `<CLUSTER-URL>',
   ```

## Configuration

You have to define the location of the `webterminal-proxy` in `app-config.yaml`:

```yaml
webTerminal:
  webSocketUrl: 'wss://example.com:3000/webterminal'
  restServerUrl: 'https://example.com:3000/webterminal/rest'
```

Optionally, you can also define the default namespace for the terminal; otherwise, `openshift-terminal` will be used:

```yaml
webTerminal:
  webSocketUrl: 'wss://example.com:3000/webterminal'
  restServerUrl: 'https://example.com:3000/webterminal/rest'
  defaultNamespace: 'default'
```
