# Orchestrator Backend Plugin for Backstage

Welcome to the backend package for the Orchestrator plugin!

For more information about the Orchestrator plugin, see the [Orchestrator Plugin documentation](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/orchestrator) on GitHub.

## Backend to get workflows from Data Index

### Prerequisites

- A valid running data index service accessible via data index graphql interface such as `http://<server:port>/graphql`

- Be sure to set the environment variable `DATA_INDEX_URL` in a terminal as follows e.g.

```shell
export DATA_INDEX_URL=http://<server:port>/graphql/
```

### Getting workflow list

- Test the plugin to see if it returns deployed workflows.

```shell
curl localhost:7007/api/orchestrator/workflows/definitions | jq .
```

- You should be able to see a response similar to this.

```json
{
  "result": [
    {
      "id": "event-timeout",
      "name": "workflow",
      "version": "0.0.1",
      "type": null,
      "endpoint": "http://172.30.206.161:80/event-timeout",
      "serviceUrl": "http://172.30.206.161:80",
      "__typename": "ProcessDefinition"
    }
  ],
  "message": "success"
}
```
