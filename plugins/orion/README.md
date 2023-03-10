# Parodos (orion)

Welcome to the parodos plugin!

former name: Orion

## Setup

1. Install the plugin into the Backstage app in `packages/app`

```bash
yarn add --cwd packages/app @parodos/plugin-orion
```

2. Add the `/parodos/` route in `/packages/app/src/App.tsx`

```ts
import { OrionPage } from '@parodos/plugin-orion';

const routes = (
  <FlatRoutes>
    // ...
    <Route path="/parodos" element={<OrionPage />} />
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
```

## Local development

For local development set the `PARODOS_AUTH_KEY` environment variable to 'Basic dGVzdDp0ZXN0'. This token is base64 encoded string containing `test:test`. You can also use `PARODOS_AUTH_KEY="Basic dGVzdDp0ZXN0" yarn dev` to start development environment with the test token. You can also create an `app-config.local.yaml` file with the following content to automatically include the token.

```yaml
proxy:
  '/parodos':
    headers:
      Authorization: 'Basic dGVzdDp0ZXN0'
```