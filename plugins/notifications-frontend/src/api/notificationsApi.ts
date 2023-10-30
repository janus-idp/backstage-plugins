import { createApiRef } from '@backstage/core-plugin-api';

// Keep in sync with BE: plugins/notifications-backend/src/service/types.ts
// TODO: Once we have more to share, we will introduce a notifications-common library.
export type Notification = {
  id: string; // UUID
  created: Date;
  readByUser: boolean;

  origin: string; // mandatory
  title: string; // mandatory
  message?: string;
  topic?: string;

  actions?: { title?: string; url: string }[];
};

export interface NotificationsApi {
  /** Create a notification. Returns its new ID. */
  post(notification: Notification): Promise<string>;

  /** Read a list of notifications based on filter parameters. */
  getNotifications(/* TODO: params */): Promise<Notification[]>;

  /** Returns the count of unread notifications for the user. */
  getUnreadCount(): Promise<number>;

  /** Marks the notification as read by the user. */
  markAsRead(notificationId: string): Promise<void>;
}

export const notificationsApiRef = createApiRef<NotificationsApi>({
  id: 'plugin.notifications',
});
