# APIs

## Fetch list of accessible repositories from a user or organization (Currently only supports Github)

**POST** </api/bulk-import/repositories>

Utilizes the Octokit REST API to fetch a list of Github repositories accessible to the github apps and/or github token provided in integrations configurations in the backstage app configuration.

Request parameters:

| Parameter name | Description                                   | Type   |
| -------------- | --------------------------------------------- | ------ |
| owner          | The HTML Url to a github organization or user | String |

Request Body:

```json
{
  "owner": "https://github.com/janus-idp"
}
```

Request Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <backstage-token>"
}
```

**Note**: The authorization header is optional if the permission framework is not enabled.

Example Request:

```bash
curl -X POST "http://localhost:7000/api/bulk-import/repositories" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <Backstage-Token>" \
    -d '{ "owner":"https://github.com/janus-idp" }'
```

Returns a list of repositories accessible to the github app and token integrations provided in the backstage app configuration. Also returns a list of errors encountered by each github app or token while fetching the repositories.

Example Response:

```json
{
  "repositories": [
    {
      "name": "backstage-plugins",
      "full_name": "janus-idp/backstage-plugins",
      "html_url": "https://github.com/janus-idp/backstage-plugins",
      "url": "https://api.github.com/repos/janus-idp/backstage-plugins"
    }
  ],
  "errors": [
    {
      "appId": "123456",
      "type": "app",
      "error": {
        "name": "error-name",
        "message": "error-message"
      }
    }
  ]
}
```

Response Status Codes:

| Status Code | Description                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200         | Repositories were successfully fetched without any errors (The `errors` array is empty).                                                                         |
| 207         | Errors were encountered during the repository fetch. (One or more errors in the `errors` array)                                                                  |
| 400         | The request body was invalid                                                                                                                                     |
| 403         | The authorization header was invalid or missing (occurs when permissions framework is enabled)                                                                   |
| 404         | No repositories and errors were returned due to no repositories owned by the potentially non-existent owner being accessible by the github apps or integrations. |
