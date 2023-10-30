import { CatalogClient } from '@backstage/catalog-client';

import { Knex } from 'knex';

import { MessagesInsert } from './db';
import {
  CreateNotificationRequest,
  Notification,
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

  const ret = dbClient('messages')
    .insert(row)
    .returning<string, { id: string }[]>('id')
    .then(ids => {
      return { msgid: ids[0].id };
    });

  return ret;
}

// getNotifications
export function getNotifications(
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

  addFilter(query, filter);

  if (pageNumber > 0) {
    query.limit(pageSize).offset((pageNumber - 1) * pageSize);
  }

  const ret = query.then(messages => {
    const notifications = messages.map(message => {
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
    });

    return notifications;
  });

  return ret;
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
