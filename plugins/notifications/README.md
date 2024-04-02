# Notifications

This Backstage front-end plugin provides:

- the `Notifications` page listing notifications from the logged-in user's perspective
- the NotificationsApi for accessing the notifications backend from front-end plugins
- an active item to the main left side menu to both notify the user about new messages and provide navigation to the Notifications page
- an alert about new system notifications

## Getting started

### Prerequisities

Have `@janus-idp/plugin-notifications-backend` installed and running.

## Installing as a dynamic plugin

The sections below are relevant for static plugins. If the plugin is expected to be installed as a dynamic one:

- follow https://github.com/janus-idp/backstage-showcase/blob/main/showcase-docs/dynamic-plugins.md#installing-a-dynamic-plugin-package-in-the-showcase
- add content of `app-config.janus-idp.yaml` into `app-config.local.yaml`.
- customize configuration configure as needed

### Configuration

There is polling used to check for new notifications. It can be tuned via `pollingIntervalMs` config property (see `app-config.janus-idp.yaml`). When set to 0, the polling is turned off.

## Installing as a static plugin

### Add NPM dependency

```
cd packages/app
yarn add @janus-idp/plugin-notifications
```

### Add left-side menu item

In the `packages/app/src/components/Root/Root.tsx`:

```
import { NotificationsActiveIcon } from '@janus-idp/plugin-notifications';

...
export const Root = ({ children }: PropsWithChildren<{}>) => (
    ...
      {/* New code: */}
      <SidebarDivider />
      <SidebarItem icon={NotificationsActiveIcon} to="notifications" text="Notifications" />

      {/* Existing code for reference: */}
      <SidebarSpace />
      <SidebarSpace />
      <SidebarDivider />
      <SidebarDivider />
      <SidebarGroup
        <SidebarGroup label="Settings"
```

### Add to router

In the `packages/app/src/App.tsx`:

```
import { NotificationsPage } from '@janus-idp/plugin-notifications';
...

export const AppBase = () => {
    ...
      {/* New code: */}
      <Route path="/notifications" element={<NotificationsPage />} />
```

## How to use the NotificationApi

Once installed as either static or dynamic plugin, a 3rd party frontend plugin can access the notifications via its frontend API:

```
import { notificationsApiRef, Notification } from '@janus-idp/plugin-notifications';

...

const notificationsApi = useApi(notificationsApiRef);
const notifications: Notification[] = await notificationsApi.getNotifications(params);

```

See `src/api/notificationsApi.ts` for more details.
