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

Adapt following based on the Parodos services deployment.

```yaml
'/parodos':
  target: 'http://localhost:8080/api/v1'
  changeOrigin: true
  redirect: follow
  cache: 'no-cache'
  headers:
    Content-Type: 'application/json'
    accept: 'application/json'

'/parodos-notifications':
  target: 'http://localhost:8081/api/v1'
  changeOrigin: true
  redirect: follow
  cache: 'no-cache'
  headers:
    Content-Type: 'application/json'
    accept: 'application/json'
```

## Local development

For local development, the [@janus-idp/backstage-plugin-parodos-auth](../parodos-auth/README.md) can be used for Basic authentication. 
The application username is `test`, password `test` there.

In addition, the [Parodos services](https://github.com/parodos-dev/parodos) need to be running. Please refer instructions there, but as a short-cut:

```
git clone https://github.com/parodos-dev/parodos.git
cd parodos
mvn clean install
cd ./workflow-examples

./start_workflow_service.sh &
./start_notification_service.sh &
```

By doing that, you should end-up with two services running at `http://localhost:8080` and `http://localhost:8081`.
