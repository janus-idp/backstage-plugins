export { notificationsPlugin, NotificationsPage } from './plugin';

// API Reference
export {
  notificationsApiRef,
  type NotificationsApi,
  type NotificationsCreateRequest,
  type NotificationsQuery,
  type NotificationsCountQuery,
} from './api';

export { type Notification } from './openapi';

// selected constants for export
export { notificationsRootRouteRef } from './routes';

// selected components for export
export { usePollingEffect } from './components/usePollingEffect';
export { NotificationsActiveIcon } from './components/NotificationsActiveIcon';
