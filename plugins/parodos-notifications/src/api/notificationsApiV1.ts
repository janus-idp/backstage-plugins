import { createApiRef } from '@backstage/core-plugin-api';

import { Observable } from 'rxjs';

export type Notification = {
  kind: string;
  metadata: {
    uuid: string;
    timestamp: Date;
    [key: string]: any;
  };
  spec?: {
    title: string;
    message: string;

    // TODO: decide whether we will mix FE-only with the persistedones
    // Catalog entity that triggered the notification, if applicable
    // originatingEntityRef?: EntityRef;

    // TODO: Probably no need for this
    // Target User/Group entity refs if the notification is not global.
    // targetEntityRefs?: Array<EntityRef>;

    // TODO: Probably no need or this - will be determined from the kind
    // icon?:  string | JSX.Element; // System icon or custom

    actions?: Array<
      { title: string; url: string } | { title: string; callback: Function }
    >;

    // TODO: mark notifications as "read" - FE specific, other consumers (i.e. SMTP) will have different marks
  };
};

export interface NotificationsApiV1 {
  post(notification: Notification): void;
  getNotifications(/* TODO params */): Observable<Notification>;
}

export const notificationsApiRef = createApiRef<NotificationsApiV1>({
  id: 'plugin.notifications',
});
