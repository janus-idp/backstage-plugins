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
  messageScope?: 'all' | 'user' | 'system';
  user?: string;
  isRead?: boolean; // if missing, include both read and unread
};

// Keep in sync with BE: plugins/notifications-backend/src/service/types.ts
export type NotificationsQuerySorting = {
  fieldName: 'title' | 'message' | 'created' | 'origin' | 'topic';
  direction: 'asc' | 'desc';
};

export type NotificationsQuery = NotificationsFilter & {
  pageSize: number;
  pageNumber: number;

  sorting?: NotificationsQuerySorting;
};
export type NotificationsCountQuery = NotificationsFilter;

// Keep in sync with BE: plugins/notifications-backend/src/service/types.ts
export type CreateNotificationRequest = {
  origin: string;
  title: string;
  message?: string;
  actions?: { title: string; url: string }[];
  topic?: string;
  targetUsers?: string[];
  targetGroups?: string[];
};

export type NotificationMarkAsRead = {
  notificationId: string;
  user: string;
  isRead: boolean;
};
export interface NotificationsApi {
  /** Create a notification. Returns its new ID. */
  post(notification: CreateNotificationRequest): Promise<string>;

  /** Read a list of notifications based on filter parameters. */
  getNotifications(query?: NotificationsQuery): Promise<Notification[]>;

  /** Returns the count of notifications for the user. */
  getNotificationsCount(query?: NotificationsCountQuery): Promise<number>;

  /** Marks the notification as read by the user. */
  markAsRead(params: NotificationMarkAsRead): Promise<void>;
}

export const notificationsApiRef = createApiRef<NotificationsApi>({
  id: 'plugin.notifications',
});
