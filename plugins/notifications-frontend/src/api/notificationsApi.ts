import { createApiRef } from '@backstage/core-plugin-api';
import {
  CreateNotificationRequest,
  Notification,
  NotificationsQuerySorting,
} from '@backstage/plugin-notifications-common';

export type NotificationsFilter = {
  containsText?: string;
  createdAfter?: Date;
  messageScope?: 'all' | 'user' | 'system';
  isRead?: boolean; // if undefined, include both read and unread
};

export type NotificationsQuery = NotificationsFilter & {
  pageSize: number;
  pageNumber: number;

  sorting?: NotificationsQuerySorting;
};
export type NotificationsCountQuery = NotificationsFilter;

export type NotificationMarkAsRead = {
  notificationId: string;
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
