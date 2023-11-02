import { CatalogClient } from '@backstage/catalog-client';

import { Knex } from 'knex';

import { ActionsInsert, MessagesInsert } from './db';
import {
  CreateNotificationRequest,
  Notification,
  NotificationAction,
  NotificationsFilter,
} from './types';

// createNotification
// returns string id of created notification
export async function createNotification(
  dbClient: Knex<any, any>,
  catalogClient: CatalogClient,
  req: CreateNotificationRequest,
): Promise<{ msgid: string }> {
  if (Array.isArray(req.targetGroups)) {
    const promises = req.targetGroups.map(group => {
      return catalogClient.getEntityByRef(`group:${group}`).then(groupRef => {
        if (!groupRef) {
          throw new Error(`group '${group}' does not exist`);
        }
      });
    });

    await Promise.all(promises);
  }

  if (Array.isArray(req.targetUsers)) {
    const promises = req.targetUsers.map(user => {
      return catalogClient.getEntityByRef(`user:${user}`).then(userRef => {
        if (!userRef) {
          throw new Error(`user '${user}' does not exist`);
        }
      });
    });

    await Promise.all(promises);
  }

  const row: MessagesInsert = {
    origin: req.origin,
    title: req.title,
    message: req.message,
    topic: req.topic,
  };

  const messagesResult = await dbClient('messages')
    .insert(row)
    .returning<string, { id: string }[]>('id');

  const messagesId = messagesResult[0].id;

  if (Array.isArray(req.actions)) {
    const actionRows: ActionsInsert[] = req.actions.map(action => ({
      url: action.url,
      title: action.title,
      messages_id: messagesId,
    }));
    await dbClient.batchInsert('actions', actionRows);
  }

  return { msgid: messagesId };
}

// getNotifications
export async function getNotifications(
  dbClient: Knex<any, any>,
  filter: NotificationsFilter,
  pageSize: number,
  pageNumber: number,
): Promise<Notification[]> {
  if (
    pageSize < 0 ||
    pageNumber < 0 ||
    (pageSize === 0 && pageNumber > 0) ||
    (pageSize > 0 && pageNumber === 0)
  ) {
    throw new Error(
      'pageSize and pageNumber must both be either 0 or greater than 0',
    );
  }

  const query = dbClient('messages').select('*');

  query.orderBy('created', 'asc');

  addFilter(query, filter);

  if (pageNumber > 0) {
    query.limit(pageSize).offset((pageNumber - 1) * pageSize);
  }

  const notifications = await query.then(messages =>
    messages.map(message => {
      const notification: Notification = {
        id: message.id,
        created: message.created,
        readByUser: false,
        origin: message.origin,
        title: message.title,
        message: message.message,
        topic: message.topic,
      };
      return notification;
    }),
  );

  const actionsMessageIds = notifications.map(notification => notification.id);

  const actionsQuery = dbClient('actions')
    .select('*')
    .whereIn('messages_id', actionsMessageIds);
  await actionsQuery.then(actions => {
    actions.forEach(action => {
      const notification = notifications.find(n => n.id === action.messages_id);
      if (notification) {
        notification.actions = notification.actions || [];
        const transformedAction: NotificationAction = {
          id: action.id,
          url: action.url,
        };
        if (action.title) {
          transformedAction.title = action.title;
        }
        notification.actions.push(transformedAction);
      }
    });
  });

  return notifications;
}

export function getNotificationsCount(
  dbClient: Knex<any, any>,
  filter: NotificationsFilter,
): Promise<{ count: number }> {
  const query = dbClient('messages').count('* as CNT');

  addFilter(query, filter);

  const ret = query.then(count => {
    const msgcount = count[0].CNT as number;
    return { count: msgcount };
  });

  return ret;
}

function addFilter(query: Knex.QueryBuilder, filter: NotificationsFilter) {
  if (filter.containsText) {
    // eslint-disable-next-line func-names
    query.where(function () {
      this.whereILike('title', `%${filter.containsText}%`).orWhereILike(
        'message',
        `%${filter.containsText}%`,
      );
    });
  }

  if (filter.createdAfter) {
    query.andWhere('created', '>', filter.createdAfter);
  }
}
