import { ConfigApi, IdentityApi } from '@backstage/core-plugin-api';

import { Observable, Subscriber } from 'rxjs';

import { listNotifications } from '../notificationsService';
import { Notification, NotificationsApiV1 } from './notificationsApiV1';

export type NotificationsApiOptions = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

const readNotifications = (
  subscriber: Subscriber<Notification>,
  backendUrl: string,
) =>
  listNotifications(backendUrl)
    .catch(reason => {
      subscriber.error(reason);
    })
    .then((notifications: Notification[] | void) => {
      if (Array.isArray(notifications))
        notifications.forEach(n => {
          subscriber.next(n);
        });
    });
export class NotificationsApiImpl implements NotificationsApiV1 {
  // private readonly configApi: ConfigApi;
  // private readonly identityApi: IdentityApi;
  private readonly backendUrl;

  constructor(options: NotificationsApiOptions) {
    this.backendUrl = options.configApi.getString('backend.baseUrl');
  }

  post(notification: Notification): void {
    // eslint-disable-next-line no-console
    console.log('TODO: post notification: ', notification);
    // TODO: send to backend
  }

  // Can call subscriber.next() repeatadly for the same notification (per uuid) to update.
  // TODO: use websocket instead of polling
  getNotifications(/* Filter params?? */): Observable<Notification> {
    const observable = new Observable<Notification>(
      (subscriber: Subscriber<Notification>) => {
        // TODO: do polling until WebSocket for "watch" is available in the backend
        readNotifications(subscriber, this.backendUrl);
      },
    );

    return observable;
  }
}
