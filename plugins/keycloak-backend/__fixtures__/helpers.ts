import { getVoidLogger } from '@backstage/backend-common';
import { TaskInvocationDefinition, TaskRunner } from '@backstage/backend-tasks';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';

import { groupMembers, groups, users } from './data';

export const BASIC_VALID_CONFIG = {
  catalog: {
    providers: {
      keycloakOrg: {
        default: {
          baseUrl: 'http://localhost:8080/auth',
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

  users = {
    find: jest.fn().mockResolvedValue(users),
    count: jest.fn().mockResolvedValue(users.length),
  };

  groups = {
    find: jest.fn().mockResolvedValue(groups),
    count: jest.fn().mockResolvedValue(groups.length),
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
