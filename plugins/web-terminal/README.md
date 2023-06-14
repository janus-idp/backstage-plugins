# Web terminal plugin for Backstage

This plugin provides a frontend for [`webterminal proxy`](https://github.com/janus-idp/webterminal-proxy). Users first enter their user token from the cluster, and then the plugin setups environment. Once it is set up, it connects to `webterminal-proxy`, which finishes setups and passes data between the frontend plugin and pod.
This plugin uses [`xterm.js`](http://xtermjs.org/) to simulate a regular terminal.

## Prerequisites

Before we can install this plugin, we need to fulfill the following requirements:

1. Deployed [`webterminal-proxy`](https://github.com/janus-idp/webterminal-proxy)
2. Installed [Web terminal operator](https://docs.openshift.com/container-platform/4.8/web_console/odc-about-web-terminal.html#odc-installing-web-terminal_odc-about-web-terminal)

## Usage

You have to define the location of the `webterminal-proxy` in `app-config.yaml`:

```yaml
webTerminal:
  webSocketUrl: 'wss://example.com:3000'
  restServerUrl: 'https://example.com:3000/rest'
```

Optionally, you can also define the default namespace for the terminal; otherwise, `openshift-terminal` will be used:

```yaml
webTerminal:
  webSocketUrl: 'wss://example.com:3000'
  restServerUrl: 'https://example.com:3000/rest'
  defaultNamespace: 'default'
```

Next, you can include the `WebTerminal` component in your catalog resource page within the entity context:

```typescript
<Grid item>
  <WebTerminal />
</Grid>
```
