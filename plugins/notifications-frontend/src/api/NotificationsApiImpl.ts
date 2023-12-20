import { FetchApi } from '@backstage/core-plugin-api';

import {
  Configuration,
  CreateBody,
  GetNotificationsRequest,
  Notification,
  NotificationsApi as NotificationsOpenApi,
} from '../openapi';
import {
  NotificationMarkAsRead,
  NotificationsApi,
  NotificationsCountQuery,
} from './notificationsApi';

export type NotificationsApiOptions = {
  fetchApi: FetchApi;
};

export class NotificationsApiImpl implements NotificationsApi {
  private readonly backendRestApi: NotificationsOpenApi;

  constructor(options: NotificationsApiOptions) {
    const configuration = new Configuration({
      fetchApi: options.fetchApi.fetch,
    });
    this.backendRestApi = new NotificationsOpenApi(configuration);
  }

  async createNotification(notification: CreateBody): Promise<string> {
    const data = await this.backendRestApi.createNotification({
      createBody: notification,
    });
    return data.messageId;
  }

  getNotifications(query: GetNotificationsRequest): Promise<Notification[]> {
    return this.backendRestApi.getNotifications(query);
  }

  async getNotificationsCount(query: NotificationsCountQuery): Promise<number> {
    const data = await this.backendRestApi.getNotificationsCount(query);
    return data.count;
  }

  async markAsRead(params: NotificationMarkAsRead): Promise<void> {
    return this.backendRestApi.setRead(params);
  }
}
