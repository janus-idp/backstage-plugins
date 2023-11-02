import { createApiRef } from '@backstage/core-plugin-api';

// Keep in sync with BE: plugins/notifications-backend/src/service/types.ts
export type NotificationAction = {
  id: string; // UUID
  title: string;
  url: string;
};

// Keep in sync with BE: plugins/notifications-backend/src/service/types.ts
export type Notification = {
  id: string; // UUID
  created: Date;
  readByUser: boolean;

  origin: string; // mandatory
  title: string; // mandatory
  message?: string;
  topic?: string;

  actions: NotificationAction[];
};

// Keep in sync with BE: plugins/notifications-backend/src/service/types.ts
export type NotificationsFilter = {
  containsText?: string;
  createdAfter?: Date;
};

export type NotificationsQuery = NotificationsFilter & {
  pageSize: number;
  pageNumber: number;
};
export type NotificationsCountQuery = NotificationsFilter & {
  unreadOnly?: boolean;
};

export interface NotificationsApi {
  /** Create a notification. Returns its new ID. */
  post(notification: Notification): Promise<string>;

  /** Read a list of notifications based on filter parameters. */
  getNotifications(query?: NotificationsQuery): Promise<Notification[]>;

  /** Returns the count of notifications for the user. */
  getNotificationsCount(query?: NotificationsCountQuery): Promise<number>;

  /** Marks the notification as read by the user. */
  markAsRead(notificationId: string): Promise<void>;
}

export const notificationsApiRef = createApiRef<NotificationsApi>({
  id: 'plugin.notifications',
});
