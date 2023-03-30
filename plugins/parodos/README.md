# Parodos

Welcome to the parodos plugin!

## Setup

1. Install the plugin into the Backstage app in `packages/app`

```bash
yarn add --cwd packages/app @parodos/plugin-parodos
```

2. Add the `/parodos/` route in `/packages/app/src/App.tsx`

```ts
import { ParodosPage } from '@parodos/plugin-parodos';

const routes = (
  <FlatRoutes>
    // ...
    <Route path="/parodos" element={<ParodosPage />} />
  </FlatRoutes>
```

3. Add `Parodos` link to the sidebar in `packages/app/src/components/Root.tsx`

   3.1. Add `MeetingRoomIcon` import to the top of the file

   ```tsx
   import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
   ```

   3.2. Add `<SidebarItem icon={MeetingRoomIcon} to="/parodos" text="Parodos" />` after `Create...` icon. The result will look like this.

   ```tsx
   <SidebarItem icon={CreateComponentIcon} to="create" text="Create..." />
   <SidebarItem icon={MeetingRoomIcon} to="/parodos" text="Parodos" />
   ```

1. Add `/parodos` endpoint to the proxy config in `app-config.yaml`.

```yaml
'/parodos':
  target: 'http://localhost:8080/api/v1'
  changeOrigin: true
  redirect: follow
  cache: 'no-cache'
  headers:
    Content-Type: 'application/json'
    accept: 'application/json'
    Authorization: ${PARODOS_AUTH_KEY}

'/parodos-notifications':
  target: 'http://localhost:8081/api/v1'
  changeOrigin: true
  redirect: follow
  cache: 'no-cache'
  headers:
    Content-Type: 'application/json'
    accept: 'application/json'
    Authorization: ${PARODOS_NOTIFICATION_AUTH_KEY}
```

## Local development

For local development and access to the workflow-service, set the `PARODOS_AUTH_KEY` environment variable to 'Basic dGVzdDp0ZXN0'.
This token is base64 encoded string containing `test:test`.

For the notification-service token, set PARODOS_NOTIFICATION_AUTH_KEY environment variable to 'Basic ZGV2OmRldg==', representing encoded `dev:dev`.

You can also use `PARODOS_AUTH_KEY="Basic dGVzdDp0ZXN0" PARODOS_NOTIFICATION_AUTH_KEY="Basic ZGV2OmRldg==" yarn dev` to start development environment with the test token.
You can also create an `app-config.local.yaml` file with the following content to automatically include the token.

```yaml
proxy:
  '/parodos':
    headers:
      Authorization: 'Basic dGVzdDp0ZXN0'

  '/parodos-notifications':
    headers:
      Authorization: 'Basic ZGV2OmRldg=='
```

## Release

The project is published to the NPM JS Registry on release: https://www.npmjs.com/package/@parodos/plugin-parodos.

To do a release:

- go to the project release page: https://github.com/parodos-dev/backstage-parodos/releases
- click **Create a new release**
- as a tag, use format **vX.Y.Z** (mind the **v** prefix!)
- as a title, use the same value as for the tag
- let the release notes to be generated, adjust
- click **Publish release**

The on-release GitHub action is triggered, leading to publishing the new version to the NPM registry.

To watch progress: https://github.com/parodos-dev/backstage-parodos/actions/workflows/on-release.yaml

If the action is failing on an expired token, it can be updated here: https://github.com/organizations/parodos-dev/settings/secrets/actions

As a side-effect of the action, a PR bumping the plugin version is created. Do not forget to merge it: https://github.com/parodos-dev/backstage-parodos/pulls
