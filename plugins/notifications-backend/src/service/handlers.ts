/* eslint-disable func-names */
import { CatalogClient } from '@backstage/catalog-client';

import { Knex } from 'knex';

import { ActionsInsert, MessagesInsert } from './db';
import {
  CreateNotificationRequest,
  Notification,
  NotificationsFilter,
  NotificationsQuerySorting,
} from './types';

const FieldsAllowedToOrderBy: string[] = [
  'title',
  'message',
  'created',
  'topic',
  'origin',
];
const OrderByDirections: string[] = ['asc', 'desc'];
const DefaultOrderBy = 'created';
const DefaultOrderDirection = 'desc';

// createNotification
// returns string id of created notification
export async function createNotification(
  dbClient: Knex<any, any>,
  catalogClient: CatalogClient,
  req: CreateNotificationRequest,
): Promise<{ messageId: string }> {
  let isUser = false;

  // validate users
  if (Array.isArray(req.targetGroups) && req.targetGroups.length > 0) {
    isUser = true;
    const promises = req.targetGroups.map(group => {
      return catalogClient.getEntityByRef(`group:${group}`).then(groupRef => {
        if (!groupRef) {
          throw new Error(`group '${group}' does not exist`);
        }
      });
    });

    await Promise.all(promises);
  }

  // validate groups
  if (Array.isArray(req.targetUsers) && req.targetUsers.length > 0) {
    isUser = true;
    const promises = req.targetUsers.map(user => {
      return catalogClient.getEntityByRef(`user:${user}`).then(userRef => {
        if (!userRef) {
          throw new Error(`user '${user}' does not exist`);
        }
      });
    });

    await Promise.all(promises);
  }

  // validate actions
  if (Array.isArray(req.actions)) {
    req.actions.forEach(action => {
      if (!action.title || !action.url) {
        throw new Error('Both action title and url are mandatory.');
      }
    });
  }

  const row: MessagesInsert = {
    origin: req.origin,
    title: req.title,
    message: req.message,
    topic: req.topic,
    is_system: !isUser,
  };

  let messageId: string;

  const ret = dbClient.transaction(trx => {
    return trx
      .insert(row)
      .returning<string, { id: string }[]>('id')
      .into('messages')
      .then(ids => {
        messageId = ids[0].id;
        if (Array.isArray(req.targetUsers)) {
          const userInserts = req.targetUsers.map(user => {
            return {
              message_id: messageId,
              user: user,
            };
          });
          return trx('users').insert(userInserts);
        }

        return undefined;
      })
      .then(() => {
        if (Array.isArray(req.targetGroups)) {
          const groupInserts = req.targetGroups.map(group => {
            return {
              message_id: messageId,
              group: group,
            };
          });
          return trx('groups').insert(groupInserts);
        }

        return undefined;
      })
      .then(() => {
        if (Array.isArray(req.actions)) {
          const actionInserts: ActionsInsert[] = req.actions.map(action => {
            return {
              url: action.url,
              title: action.title,
              message_id: messageId,
            };
          });

          return trx('actions').insert(actionInserts);
        }

        return undefined;
      })
      .then(() => {
        return { messageId: messageId };
      });
  });

  return ret;
}

// getNotifications
export async function getNotifications(
  dbClient: Knex<any, any>,
  catalogClient: CatalogClient,
  filter: NotificationsFilter,
  pageSize: number,
  pageNumber: number,
  sorting: NotificationsQuerySorting,
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

  if (!filter.user) {
    throw new Error('user parameter is missing in request');
  }

  const orderBy = sorting.fieldName || DefaultOrderBy;
  const direction = sorting.direction || DefaultOrderDirection;
  if (
    !FieldsAllowedToOrderBy.includes(orderBy) ||
    !OrderByDirections.includes(direction)
  ) {
    throw new Error(
      `The orderBy parameter can be one of ${FieldsAllowedToOrderBy.join(
        ',',
      )}. The orderByDirec can be either ${OrderByDirections.join(' or ')}.`,
    );
  }

  const userGroups = await getUserGroups(catalogClient, filter.user);

  const query = createQuery(dbClient, filter, userGroups);

  query.orderBy(orderBy, direction);

  if (pageNumber > 0) {
    query.limit(pageSize).offset((pageNumber - 1) * pageSize);
  }

  const notifications: Notification[] = await query.select('*').then(messages =>
    messages.map((message: any) => {
      const notification: Notification = {
        id: message.id,
        created: message.created,
        isSystem: message.is_system,
        readByUser: message.read ? message.read : false,
        origin: message.origin,
        title: message.title,
        message: message.message,
        topic: message.topic,
        actions: [],
      };
      return notification;
    }),
  );

  const actionsMessageIds = notifications.map(notification => notification.id);

  const actionsQuery = dbClient('actions')
    .select('*')
    .whereIn('message_id', actionsMessageIds);
  await actionsQuery.then(actions => {
    actions.forEach(action => {
      const notification = notifications.find(n => n.id === action.message_id);
      if (notification) {
        notification.actions.push({
          id: action.id,
          url: action.url,
          title: action.title,
        });
      }
    });
  });

  return notifications;
}

export async function getNotificationsCount(
  dbClient: Knex<any, any>,
  catalogClient: CatalogClient,
  filter: NotificationsFilter,
): Promise<{ count: number }> {
  if (!filter.user) {
    throw new Error('user parameter is missing in request');
  }

  const userGroups = await getUserGroups(catalogClient, filter.user);

  const query = createQuery(dbClient, filter, userGroups);

  const ret = query.count('* as CNT').then(count => {
    const msgcount = count[0].CNT as number;
    return { count: msgcount };
  });

  return ret;
}

export async function setRead(
  dbClient: Knex<any, any>,
  messageId: string,
  user: string,
  read: boolean,
) {
  let isUpdate = false;
  let isInsert = false;

  // verify that message id exists
  await dbClient('messages')
    .where('id', messageId)
    .count('* as CNT')
    .then(count => {
      const msgcount = count[0].CNT;

      if (msgcount !== '1') {
        throw new Error(`message ID ${messageId} does not exist`);
      }
    });

  // check user row exists
  await dbClient('users')
    .where('message_id', messageId)
    .andWhere('user', user)
    .select('*')
    .then(rows => {
      if (!Array.isArray(rows)) {
        return;
      }
      if (rows.length === 1) {
        isUpdate = rows[0].read !== read;
      } else if (rows.length === 0) {
        isInsert = true;
      }
    });

  // insert/update user row
  if (isInsert) {
    await dbClient('users').insert({
      message_id: messageId,
      user: user,
      read: read,
    });
  }

  if (isUpdate) {
    await dbClient('users')
      .where('message_id', messageId)
      .andWhere('user', user)
      .update('read', read);
  }
}

function createQuery(
  dbClient: Knex<any, any>,
  filter: NotificationsFilter,
  userGroups: string[],
) {
  // join messages table with users table to get message status. E.g read/unread
  const query = dbClient('messages');

  query.leftJoin(
    function () {
      this.select('*')
        .from('users')
        .where('users.user', filter.user)
        .as('users');
    },
    function () {
      this.on('messages.id', '=', 'users.message_id');
    },
  );

  // select messages matching filter

  // select either system messages or messages intended for the user
  query.where(function () {
    if (filter.messageScope !== 'user') {
      this.where('is_system', true);
    }

    if (filter.messageScope !== 'system') {
      this.orWhere(function () {
        this.where('is_system', false).andWhere(function () {
          this.whereIn('id', function () {
            this.select('message_id').from('users').where('user', filter.user);
          });

          if (Array.isArray(userGroups) && userGroups.length > 0) {
            this.orWhereIn('id', function () {
              this.select('message_id')
                .from('groups')
                .whereIn('group', userGroups);
            });
          }
        });
      });
    }
  });

  // filter by text
  if (filter.containsText) {
    query.andWhere(function () {
      this.whereILike('title', `%${filter.containsText}%`).orWhereILike(
        'message',
        `%${filter.containsText}%`,
      );
    });
  }

  // filter by time
  if (filter.createdAfter) {
    query.andWhere('created', '>', filter.createdAfter);
  }

  // filter by read/unread
  switch (filter.read) {
    case 'true':
      query.andWhere('read', true);
      break;
    case 'false':
      query.andWhere(function () {
        this.where('read', false).orWhereNull('read');
      });
      break;
    case undefined:
      break;
    default:
      throw new Error(
        'value of parameter "read" must be either "false" or "true"',
      );
  }

  return query;
}

function getUserGroups(
  catalogClient: CatalogClient,
  user: string,
): Promise<string[]> {
  return catalogClient.getEntityByRef(`user:${user}`).then(userRef => {
    if (!userRef) {
      throw new Error(`user '${user}' does not exist`);
    }

    if (userRef.spec && Array.isArray(userRef.spec.memberOf)) {
      return userRef.spec.memberOf.map(value => {
        if (value) {
          return value.toString();
        }
        return '';
      });
    }

    return [];
  });
}
/* eslint-enable func-names */
