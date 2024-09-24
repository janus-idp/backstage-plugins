import type {
  LoggerService,
  SchedulerServiceTaskInvocationDefinition,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import type { ServiceMock } from '@backstage/backend-test-utils';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';

import {
  groupMembers,
  topLevelGroups23orHigher,
  topLevelGroupsLowerThan23,
  users,
} from './data';

export const CONFIG = {
  catalog: {
    providers: {
      keycloakOrg: {
        default: {
          baseUrl: 'http://localhost:8080',
        },
      },
    },
  },
} as const;

export const assertLogMustNotInclude = (
  logger: ServiceMock<LoggerService>,
  secrets: string[],
) => {
  const logMethods: (keyof LoggerService)[] = [
    'debug',
    'error',
    'info',
    'warn',
  ];
  logMethods.forEach(methodName => {
    const method = logger[methodName];
    if (jest.isMockFunction(method)) {
      const json = JSON.stringify(method.mock.calls);
      secrets.forEach(secret => {
        if (json.includes(secret)) {
          throw new Error(`Log must not include secret "${secret}"`);
        }
      });
    }
  });
};

export const authMock = jest.fn();

export class KeycloakAdminClientMockServerv18 {
  public constructor() {
    return;
  }

  serverInfo = {
    find: jest.fn().mockResolvedValue({
      systemInfo: {
        version: '18.0.6.redhat-00001',
      },
    }),
  };

  users = {
    find: jest.fn().mockResolvedValue(users),
    count: jest.fn().mockResolvedValue(users.length),
  };

  groups = {
    find: jest.fn().mockResolvedValue(topLevelGroupsLowerThan23),
    count: jest.fn().mockResolvedValue(3),
    listMembers: jest
      .fn()
      .mockResolvedValueOnce(groupMembers[0].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[1].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[2].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[3].map(username => ({ username }))),
  };

  auth = authMock;
}

export class KeycloakAdminClientMockServerv24 {
  public constructor() {
    return;
  }

  serverInfo = {
    find: jest.fn().mockResolvedValue({
      systemInfo: {
        version: '24.0.6.redhat-00001',
      },
    }),
  };

  users = {
    find: jest.fn().mockResolvedValue(users),
    count: jest.fn().mockResolvedValue(users.length),
  };

  groups = {
    find: jest.fn().mockResolvedValue(topLevelGroups23orHigher),
    findOne: jest.fn().mockResolvedValue({
      id: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
      name: 'biggroup',
      path: '/biggroup',
      subGroupCount: 1,
      subGroups: [],
      access: {
        view: true,
        viewMembers: true,
        manageMembers: false,
        manage: false,
        manageMembership: false,
      },
    }),
    count: jest.fn().mockResolvedValue(3),
    listSubGroups: jest.fn().mockResolvedValue([
      {
        id: 'eefa5b46-0509-41d8-b8b3-7ddae9c83632',
        name: 'subgroup',
        path: '/biggroup/subgroup',
        parentId: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
        subGroupCount: 0,
        subGroups: [],
        access: {
          view: true,
          viewMembers: true,
          manageMembers: false,
          manage: false,
          manageMembership: false,
        },
      },
    ]),
    listMembers: jest
      .fn()
      .mockResolvedValueOnce(groupMembers[0].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[1].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[2].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[3].map(username => ({ username }))),
  };

  auth = authMock;
}

export class SchedulerServiceTaskRunnerMock
  implements SchedulerServiceTaskRunner
{
  private tasks: SchedulerServiceTaskInvocationDefinition[] = [];
  async run(task: SchedulerServiceTaskInvocationDefinition) {
    this.tasks.push(task);
  }
  async runAll() {
    const abortSignal = jest.fn() as unknown as AbortSignal;
    for await (const task of this.tasks) {
      await task.fn(abortSignal);
    }
  }
}

export const scheduler = mockServices.scheduler.mock({
  createScheduledTaskRunner() {
    return new SchedulerServiceTaskRunnerMock();
  },
});

export const connection = {
  applyMutation: jest.fn(),
  refresh: jest.fn(),
} as unknown as EntityProviderConnection;
