/* eslint-disable func-names */
import { CatalogClient } from '@backstage/catalog-client';

import { Knex } from 'knex';

import { Components, Paths } from '../openapi';
import {
  DefaultMessageScope,
  DefaultOrderBy,
  DefaultOrderDirection,
  DefaultPageNumber,
  DefaultPageSize,
} from './constants';
import { ActionsInsert, dbValToBoolean, MessagesInsert } from './db';
import {
  MessageScopes,
  NotificationsFilterRequest,
  NotificationsOrderByDirections,
  NotificationsOrderByFields,
  NotificationsSortingRequest,
} from './types';

// createNotification
// returns string id of created notification
export async function createNotification(
  dbClient: Knex<any, any>,
  catalogClient: CatalogClient,
  req: Paths.CreateNotification.RequestBody,
): Promise<Paths.CreateNotification.Responses.$200> {
  let isUser = false;

  // validate users
  if (
    req.targetGroups &&
    Array.isArray(req.targetGroups) &&
    req.targetGroups.length > 0
  ) {
    isUser = true;
    await validateUsersGroups(false, req.targetGroups, catalogClient);
  }

  // validate groups
  if (
    req.targetUsers &&
    Array.isArray(req.targetUsers) &&
    req.targetUsers.length > 0
  ) {
    isUser = true;
    await validateUsersGroups(true, req.targetUsers, catalogClient);
  }

  // validate actions
  if (Array.isArray(req.actions) && req.actions.length > 0) {
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
    created: new Date().toISOString(),
  };

  let messageId: string;

  const ret = dbClient.transaction(trx => {
    return trx
      .insert(row)
      .returning<string, { id: string }[]>('id')
      .into('messages')
      .then(ids => {
        messageId = ids[0].id;
        if (Array.isArray(req.targetUsers) && req.targetUsers.length > 0) {
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
        if (Array.isArray(req.targetGroups) && req.targetGroups.length > 0) {
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
        if (Array.isArray(req.actions) && req.actions.length > 0) {
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
  loggedInUser: string,
  catalogClient: CatalogClient,
  filter: NotificationsFilterRequest,
  pageSize: number = DefaultPageSize,
  pageNumber: number = DefaultPageNumber,
  sorting: NotificationsSortingRequest,
): Promise<Paths.GetNotifications.Responses.$200> {
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

  if (!filter.messageScope) {
    filter.messageScope = DefaultMessageScope;
  } else if (!MessageScopes.includes(filter.messageScope)) {
    throw new Error(
      `messageScope parameter must be one of ${MessageScopes.join()}`,
    );
  }

  const orderBy = sorting.orderBy || DefaultOrderBy;
  const orderByDirec = sorting.orderByDirec || DefaultOrderDirection;
  if (
    !NotificationsOrderByFields.includes(orderBy) ||
    !NotificationsOrderByDirections.includes(orderByDirec)
  ) {
    throw new Error(
      `The orderBy parameter can be one of ${NotificationsOrderByFields.join(
        ',',
      )}. The orderByDirec can be either ${NotificationsOrderByDirections.join(
        ' or ',
      )}.`,
    );
  }

  const userGroups = await getUserGroups(catalogClient, loggedInUser);

  const query = createQuery(dbClient, loggedInUser, filter, userGroups);

  query.orderBy(orderBy, orderByDirec);

  if (pageNumber > 0) {
    query.limit(pageSize).offset((pageNumber - 1) * pageSize);
  }

  const notifications = await query.select('*').then(messages =>
    messages.map((message: any) => {
      const notification: Components.Schemas.Notification = {
        id: message.id,
        created: message.created,
        isSystem: dbValToBoolean(message.is_system),
        readByUser: dbValToBoolean(message.read),
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
  loggedInUser: string,
  catalogClient: CatalogClient,
  filter: NotificationsFilterRequest,
): Promise<Paths.GetNotificationsCount.Responses.$200> {
  if (!filter.messageScope) {
    filter.messageScope = DefaultMessageScope;
  }

  const userGroups = await getUserGroups(catalogClient, loggedInUser);

  const query = createQuery(dbClient, loggedInUser, filter, userGroups);

  const ret = query.count('* as CNT').then(count => {
    const msgcount = Number.parseInt(count[0].CNT.toString(), 10);
    const result: Paths.GetNotificationsCount.Responses.$200 = {
      count: msgcount,
    };
    return result;
  });

  return ret;
}

export async function setRead(
  dbClient: Knex<any, any>,
  loggedInUser: string,
  messageId: string,
  read: boolean,
) {
  let isUpdate = false;
  let isInsert = false;

  // verify that message id exists
  await dbClient('messages')
    .where('id', messageId)
    .count('* as CNT')
    .then(count => {
      const msgcount = count[0].CNT.toString();

      if (msgcount !== '1') {
        throw new Error(`message ID ${messageId} does not exist`);
      }
    });

  // check user row exists
  await dbClient('users')
    .where('message_id', messageId)
    .andWhere('user', loggedInUser)
    .select('*')
    .then(rows => {
      if (!Array.isArray(rows)) {
        return;
      }
      if (rows.length === 1) {
        isUpdate = true;
      } else if (rows.length === 0) {
        isInsert = true;
      }
    });

  // insert/update user row
  if (isInsert) {
    await dbClient('users').insert({
      message_id: messageId,
      user: loggedInUser,
      read: read,
    });
  }

  if (isUpdate) {
    await dbClient('users')
      .where('message_id', messageId)
      .andWhere('user', loggedInUser)
      .update('read', read);
  }
}

function createQuery(
  dbClient: Knex<any, any>,
  loggedInUser: string,
  filter: NotificationsFilterRequest,
  userGroups: string[],
) {
  // join messages table with users table to get message status. E.g read/unread
  const query = dbClient('messages');

  query.leftJoin(
    function () {
      this.select('*')
        .from('users')
        .where('users.user', loggedInUser)
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
            this.select('message_id').from('users').where('user', loggedInUser);
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
      // there is bug for SQLite around this: https://github.com/knex/knex/issues/5604
      if (dbClient.client.config.client.includes('sqlite')) {
        this.whereLike('title', `%${filter.containsText}%`).orWhereLike(
          'message',
          `%${filter.containsText}%`,
        );
      } else {
        this.whereILike('title', `%${filter.containsText}%`).orWhereILike(
          'message',
          `%${filter.containsText}%`,
        );
      }
    });
  }

  // filter by time
  if (filter.createdAfter) {
    query.andWhere('created', '>', filter.createdAfter);
  }

  // filter by read/unread
  switch (filter.read) {
    case true:
      query.andWhere('read', true);
      break;
    case false:
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

async function validateUsersGroups(
  isUsers: boolean,
  names: string[],
  catalogClient: CatalogClient,
) {
  const type: string = isUsers ? 'user' : 'group';
  const promises = names.map(name => {
    if (!name.includes('/')) {
      throw new Error('users and groups must be of the form: namespace/name');
    }

    return catalogClient.getEntityByRef(`${type}:${name}`).then(ref => {
      if (!ref) {
        throw new Error(`${type} '${name}' does not exist`);
      }
    });
  });

  await Promise.all(promises);
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
          const strValue = value.toString();
          let groupName: string;
          // remove the type prefix
          const splits = strValue.split(':', 2);
          if (splits.length === 2) {
            groupName = splits[1];
          } else {
            groupName = splits[0];
          }

          // add namespace if it is missing
          if (!groupName.includes('/')) {
            groupName = `${userRef.metadata.namespace}/${groupName}`;
          }

          return groupName;
        }
        return '';
      });
    }

    return [];
  });
}
/* eslint-enable func-names */
