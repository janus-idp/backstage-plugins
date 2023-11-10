import { ConfigApi, IdentityApi } from '@backstage/core-plugin-api';

import {
  CreateNotificationRequest,
  Notification,
  NotificationMarkAsRead,
  NotificationsApi,
  NotificationsCountQuery,
  NotificationsFilter,
  NotificationsQuery,
} from './notificationsApi';

export type NotificationsApiOptions = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class NotificationsApiImpl implements NotificationsApi {
  private readonly backendUrl: string;
  private readonly identityApi: IdentityApi;

  constructor(options: NotificationsApiOptions) {
    this.backendUrl = options.configApi.getString('backend.baseUrl');
    this.identityApi = options.identityApi;
  }

  private async getLogedInUsername(): Promise<string> {
    const { userEntityRef } = await this.identityApi.getBackstageIdentity();
    if (!userEntityRef.startsWith('user:')) {
      throw new Error('The logged-in user is not of an user entity type.');
    }
    return userEntityRef.slice('start:'.length - 1);
  }

  private addFilter(url: URL, user: string, filter: NotificationsFilter) {
    url.searchParams.append('user', user);

    if (filter.containsText) {
      url.searchParams.append('containsText', filter.containsText);
    }
    if (filter.createdAfter) {
      url.searchParams.append(
        'createdAfter',
        filter.createdAfter.toISOString(),
      );
    }
    if (filter.messageScope) {
      url.searchParams.append('messageScope', filter.messageScope);
    }
    if (filter.isRead !== undefined) {
      url.searchParams.append('read', filter.isRead ? 'true' : 'false');
    }
  }

  async post(notification: CreateNotificationRequest): Promise<string> {
    const url = new URL(`${this.backendUrl}/api/notifications/notifications`);

    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(notification),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(data.message || data.error?.message);
    }

    return Promise.resolve(data.messageId);
  }

  async getNotifications(query: NotificationsQuery): Promise<Notification[]> {
    const url = new URL(`${this.backendUrl}/api/notifications/notifications`);
    const user = await this.getLogedInUsername();

    url.searchParams.append('pageSize', `${query.pageSize}`);
    url.searchParams.append('pageNumber', `${query.pageNumber}`);

    if (query.sorting) {
      url.searchParams.append('orderBy', `${query.sorting.fieldName}`);
      url.searchParams.append('orderByDirec', `${query.sorting.direction}`);
    }

    this.addFilter(url, user, query);

    const response = await fetch(url.href);
    const data = await response.json();
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(data.message);
    }

    if (!Array.isArray(data)) {
      throw new Error('Unexpected format of notifications received');
    }

    return data;
  }

  async getNotificationsCount(query: NotificationsCountQuery): Promise<number> {
    const url = new URL(
      `${this.backendUrl}/api/notifications/notifications/count`,
    );
    const user = await this.getLogedInUsername();

    this.addFilter(url, user, query);

    const response = await fetch(url.href);
    const data = await response.json();
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(data.message);
    }

    const count = parseInt(data.count, 10);
    if (Number.isNaN(count)) {
      throw new Error('Unexpected format of notifications count received');
    }

    return count;
  }

  async markAsRead({
    notificationId,
    isRead,
  }: NotificationMarkAsRead): Promise<void> {
    const url = new URL(
      `${this.backendUrl}/api/notifications/notifications/read`,
    );
    const user = await this.getLogedInUsername();

    url.searchParams.append('read', isRead ? 'true' : 'false');
    url.searchParams.append('user', user);
    url.searchParams.append('messageId', notificationId);

    const response = await fetch(url.href, {
      method: 'PUT',
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('Failed to mark the message as read');
    }
  }
}
