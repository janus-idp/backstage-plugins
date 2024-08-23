import { getVoidLogger } from '@backstage/backend-common';
import { TaskInvocationDefinition, TaskRunner } from '@backstage/backend-tasks';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';

import { groupMembers, groups, subgroups, topLevelGroups, users } from './data';

export const BASIC_VALID_CONFIG = {
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

export const logMock = jest.fn();

export const createLogger = () => {
  const logger = getVoidLogger();
  logger.child = () => logger;
  ['log', ...Object.keys(logger.levels)].forEach(logFunctionName => {
    (logger as any)[logFunctionName] = function LogMock() {
      logMock(logFunctionName, ...arguments);
    };
  });
  return logger;
};

export const assertLogMustNotInclude = (secrets: string[]) => {
  const json = JSON.stringify(logMock.mock.calls);
  secrets.forEach(secret => {
    if (json.includes(secret)) {
      throw new Error(`Log must not include secret "${secret}"`);
    }
  });
};

export const authMock = jest.fn();

export class KeycloakAdminClientMock {
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
    find: jest.fn().mockResolvedValue(topLevelGroups),
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
    count: jest.fn().mockResolvedValue(groups.length),
    listSubGroups: jest.fn().mockResolvedValue(subgroups),
    listMembers: jest
      .fn()
      .mockResolvedValueOnce(groupMembers[0].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[1].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[2].map(username => ({ username })))
      .mockResolvedValueOnce(groupMembers[3].map(username => ({ username }))),
  };

  auth = authMock;
}

class FakeAbortSignal implements AbortSignal {
  readonly aborted = false;
  readonly reason = undefined;
  onabort() {}
  throwIfAborted() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
}

export class ManualTaskRunner implements TaskRunner {
  private tasks: TaskInvocationDefinition[] = [];

  async run(task: TaskInvocationDefinition) {
    this.tasks.push(task);
  }

  async runAll() {
    const abortSignal = new FakeAbortSignal();
    for await (const task of this.tasks) {
      await task.fn(abortSignal);
    }
  }

  clear() {
    this.tasks = [];
  }
}

export const connection = {
  applyMutation: jest.fn(),
  refresh: jest.fn(),
} as unknown as EntityProviderConnection;
