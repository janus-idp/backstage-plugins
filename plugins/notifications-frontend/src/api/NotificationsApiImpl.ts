import { ConfigApi, IdentityApi } from '@backstage/core-plugin-api';

import { listNotifications } from '../notificationsService';
import { Notification, NotificationsApi } from './notificationsApi';

export type NotificationsApiOptions = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class NotificationsApiImpl implements NotificationsApi {
  private readonly backendUrl: string;

  constructor(options: NotificationsApiOptions) {
    this.backendUrl = options.configApi.getString('backend.baseUrl');
  }

  post(notification: Notification): Promise<string> {
    // eslint-disable-next-line no-console
    console.log('TODO: implement post notification: ', notification);
    // TODO: send to backend
    return Promise.resolve('id-todo');
  }

  getNotifications(/* Filter params?? */): Promise<Notification[]> {
    return listNotifications(this.backendUrl);
  }

  getUnreadCount(): Promise<number> {
    return Promise.resolve(1 /* TODO */);
  }

  markAsRead(notificationId: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('TODO: markAsRead: ', notificationId);
    return Promise.resolve();
  }
}
