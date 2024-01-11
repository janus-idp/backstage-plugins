import { mockServices } from '@backstage/backend-test-utils';
import { CatalogClient } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';

import { Knex } from 'knex';

import { initDB } from './db';
import {
  createNotification,
  getNotifications,
  getNotificationsCount,
  setRead,
} from './handlers';

describe('handlers', () => {
  //
  // create global test vars
  //
  let dbClient: Knex<any, any>;
  let catalogClient: CatalogClient;
  const catalogUser = 'test';
  const catalogGroup = 'test';
  const userEntity: Entity = {
    apiVersion: 'v1',
    kind: 'user',
    metadata: {
      name: catalogUser,
    },
    spec: {
      memberOf: ['test'],
    },
  };
  const groupEntity: Entity = {
    apiVersion: 'v1',
    kind: 'group',
    metadata: {
      name: catalogGroup,
    },
  };

  //
  // initialize global test vars
  //
  beforeAll(async () => {
    dbClient = await initDB(
      mockServices.rootConfig({
        data: {
          client: 'better-sqlite3',
          connection: ':memory:',
          useNullAsDefault: true,
        },
      }),
    );

    catalogClient = new CatalogClient({
      discoveryApi: {
        getBaseUrl: jest.fn(),
      },
      fetchApi: {
        fetch: jest.fn(),
      },
    });

    catalogClient.getEntityByRef = jest
      .fn()
      .mockImplementation(async (s: string): Promise<Entity | undefined> => {
        const args = s.split(':', 2);
        const kind = args[0];
        const entity = args[1];

        switch (kind) {
          case 'user':
            if (entity === catalogUser) {
              return userEntity;
            }
            break;
          case 'group':
            if (entity === catalogGroup) {
              return groupEntity;
            }
            break;
          default:
            return undefined;
        }

        return undefined;
      });
  });

  //
  // tests
  //
  it('getNotifications - 0 notifications', async () => {
    const notifications = await getNotifications(
      dbClient,
      catalogUser,
      catalogClient,
      {},
      undefined,
      undefined,
      {},
    );
    expect(Array.isArray(notifications)).toBeTruthy();
  });

  it('getNotifications - unknown user', async () => {
    let hadError = false;

    expect.assertions(1);
    try {
      await getNotifications(
        dbClient,
        'unknown',
        catalogClient,
        {},
        undefined,
        undefined,
        {},
      );
    } catch (e) {
      if (e instanceof Error) {
        hadError = true;
      }
    }

    expect(hadError).toBeTruthy();
  });

  it('getNotificationsCount - 0 notifications', async () => {
    const result = await getNotificationsCount(
      dbClient,
      catalogUser,
      catalogClient,
      {},
    );
    expect(result.count).toEqual(0);
  });

  it('create and get - user notification', async () => {
    const before = new Date();
    before.setMilliseconds(0);

    const resultCreate = await createNotification(dbClient, catalogClient, {
      origin: 'test',
      title: 'test',
      targetUsers: [catalogUser],
    });

    const after = new Date();

    expect(resultCreate.messageId).toBeTruthy();

    const resultGet = await getNotifications(
      dbClient,
      catalogUser,
      catalogClient,
      {},
      undefined,
      undefined,
      {},
    );

    const createdDate = new Date(resultGet[0].created);

    expect(resultGet).toHaveLength(1);
    expect(createdDate >= before).toBeTruthy();
    expect(createdDate < after).toBeTruthy();
    expect(resultGet[0].isSystem).toBeFalsy();
  });

  it('create and get - system notification', async () => {
    const before = new Date();
    before.setMilliseconds(0);

    const resultCreate = await createNotification(dbClient, catalogClient, {
      origin: 'test',
      title: 'test',
    });

    const after = new Date();

    expect(resultCreate.messageId).toBeTruthy();

    const resultGet = await getNotifications(
      dbClient,
      catalogUser,
      catalogClient,
      { messageScope: 'system' },
      undefined,
      undefined,
      {},
    );

    const createdDate = new Date(resultGet[0].created);

    expect(resultGet).toHaveLength(1);
    expect(createdDate >= before).toBeTruthy();
    expect(createdDate < after).toBeTruthy();
    expect(resultGet[0].isSystem).toBeTruthy();
  });

  it('mark as read', async () => {
    const resultGet = await getNotifications(
      dbClient,
      catalogUser,
      catalogClient,
      { messageScope: 'all' },
      undefined,
      undefined,
      {},
    );

    const setReadPromises: Promise<void>[] = resultGet.map(notification =>
      setRead(dbClient, catalogUser, notification.id, true),
    );
    await Promise.all(setReadPromises);

    const resultGetRead = await getNotifications(
      dbClient,
      catalogUser,
      catalogClient,
      { messageScope: 'all', read: true },
      undefined,
      undefined,
      {},
    );

    expect(resultGetRead).toHaveLength(resultGet.length);
  });
});
