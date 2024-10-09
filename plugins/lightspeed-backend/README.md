# Lightspeed Backend

This is the lightspeed backend plugin that enables you to interact with any LLM server running a model with OpenAI's API compatibility.

## Getting Started

### Installing the plugin

```bash
yarn add --cwd packages/backend  @janus-idp/backstage-plugin-lightspeed-backend
```

### Configuring the Backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(import('@janus-idp/backstage-plugin-lightspeed-backend'));

backend.start();
```

### Plugin Configurations

Add the following lightspeed configurations into your `app-config.yaml` file:

```yaml
lightspeed:
  servers:
    - id: <server id>
      url: <serverURL>
      token: <api key> # dummy token
```

Example local development configuration:

```yaml
lightspeed:
  servers:
    - id: 'my-llm-server'
      url: 'https://localhost:443/v1'
      token: 'js92n-ssj28dbdk902' # dummy token
```
