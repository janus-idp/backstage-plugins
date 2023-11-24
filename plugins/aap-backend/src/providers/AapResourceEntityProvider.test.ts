import { getVoidLogger } from '@backstage/backend-common';
import { TaskInvocationDefinition, TaskRunner } from '@backstage/backend-tasks';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';

import {
  listJobTemplates,
  listWorkflowJobTemplates,
} from '../clients/AapResourceConnector';
import { AapResourceEntityProvider } from './AapResourceEntityProvider';

const AUTH_HEADER = 'Bearer xxxx'; // NOSONAR

const BASIC_VALID_CONFIG = {
  catalog: {
    providers: {
      aap: {
        dev: {
          baseUrl: 'http://localhost:8080',
        },
      },
    },
  },
} as const;

const BASIC_VALID_CONFIG_2 = {
  catalog: {
    providers: {
      aap: {
        dev: {
          baseUrl: 'http://localhost:8080',
          authorization: AUTH_HEADER,
        },
      },
    },
  },
} as const;

const connection = {
  applyMutation: jest.fn(),
  refresh: jest.fn(),
} as unknown as EntityProviderConnection;

jest.mock('../clients/AapResourceConnector', () => ({
  ...jest.requireActual('../clients/AapResourceConnector'),
  listJobTemplates: jest.fn().mockReturnValue({}),
  listWorkflowJobTemplates: jest.fn().mockReturnValue({}),
}));

class FakeAbortSignal implements AbortSignal {
  readonly aborted = false;
  readonly reason = undefined;
  onabort() {
    return null;
  }
  throwIfAborted() {
    return null;
  }
  addEventListener() {
    return null;
  }
  removeEventListener() {
    return null;
  }
  dispatchEvent() {
    return true;
  }
}

class ManualTaskRunner implements TaskRunner {
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

describe('AapResourceEntityProvider', () => {
  const logMock = jest.fn();

  const logger = getVoidLogger();
  logger.child = () => logger;
  ['log', ...Object.keys(logger.levels)].forEach(logFunctionName => {
    (logger as any)[logFunctionName] = function LogMock() {
      logMock(logFunctionName, ...arguments);
    };
  });

  const manualTaskRunner = new ManualTaskRunner();

  beforeEach(() => {
    jest.clearAllMocks();
    manualTaskRunner.clear();
  });

  afterEach(() => {
    const logs = JSON.stringify(logMock.mock.calls);
    // eslint-disable-next-line jest/no-standalone-expect
    expect(logs).not.toContain(AUTH_HEADER);
  });

  it('should return an empty array if no providers are configured', () => {
    const config = new ConfigReader({});

    const result = AapResourceEntityProvider.fromConfig(config, {
      logger,
    });

    expect(result).toEqual([]);
  });

  it('should not run without a authorization', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    expect(() =>
      AapResourceEntityProvider.fromConfig(config, {
        logger,
      }),
    ).toThrow(
      "Missing required config value at 'catalog.providers.aap.dev.authorization",
    );
  });

  it('should not run without a valid schedule', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);

    expect(() =>
      AapResourceEntityProvider.fromConfig(config, {
        logger,
      }),
    ).toThrow(
      'No schedule provided neither via code nor config for AapResourceEntityProvider:dev.',
    );
  });

  it('should return a single provider if one is configured', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);
    const aap = AapResourceEntityProvider.fromConfig(config, {
      logger,
      schedule: manualTaskRunner,
    });

    expect(aap).toHaveLength(1);
  });

  it('should return provider name', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);

    const aap = AapResourceEntityProvider.fromConfig(config, {
      logger,
      schedule: manualTaskRunner,
    });

    expect(aap.map(k => k.getProviderName())).toEqual([
      'AapResourceEntityProvider:dev',
    ]);
  });

  it('should connect', async () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);

    const aap = AapResourceEntityProvider.fromConfig(config, {
      logger,
      schedule: manualTaskRunner,
    });

    const result = await Promise.all(
      aap.map(async k => await k.connect(connection)),
    );
    expect(result).toEqual([undefined]);
  });

  it('should connect and run should resolves', async () => {
    (listJobTemplates as jest.Mock).mockReturnValue(
      Promise.resolve([
        {
          url: 'https://aap.com',
          name: 'demoJobTemplate',
          description: 'test description',
          type: 'job_template',
        },
      ]),
    );
    (listWorkflowJobTemplates as jest.Mock).mockReturnValue(
      Promise.resolve([
        {
          url: 'https://aap.worfkllow.com',
          name: 'demoWorkflowJobTemplate',
          description: 'test workflow description',
          type: 'workflow_job_template',
        },
      ]),
    );
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);

    const aap = AapResourceEntityProvider.fromConfig(config, {
      logger,
      schedule: manualTaskRunner,
    });

    for await (const k of aap) {
      await k.connect(connection);
      await manualTaskRunner.runAll();
    }

    expect(connection.applyMutation).toHaveBeenCalledTimes(1);
    expect(
      (connection.applyMutation as jest.Mock).mock.calls,
    ).toMatchSnapshot();
  });

  it('should connect and run should resolves even if one api call fails', async () => {
    const error: Error & { config?: any; status?: number } = new Error(
      'Request failed with status code 401',
    );
    error.config = {
      header: {
        authorization: 'Bearer xxxx', // NOSONAR
      },
    };
    error.status = 401;
    (listJobTemplates as jest.Mock).mockRejectedValue(error);
    (listWorkflowJobTemplates as jest.Mock).mockReturnValue(
      Promise.resolve([
        {
          url: 'https://aap.worfkllow.com',
          name: 'demoWorkflowJobTemplate',
          description: 'test workflow description',
          type: 'workflow_job_template',
        },
      ]),
    );
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);

    const aap = AapResourceEntityProvider.fromConfig(config, {
      logger,
      schedule: manualTaskRunner,
    });

    for await (const k of aap) {
      await k.connect(connection);
      await manualTaskRunner.runAll();
    }

    expect(connection.applyMutation).toHaveBeenCalledTimes(1);
    expect(
      (connection.applyMutation as jest.Mock).mock.calls,
    ).toMatchSnapshot();

    expect(logMock).toHaveBeenCalledWith(
      'info',
      'Discovering ResourceEntities from AAP http://localhost:8080',
    );
    expect(logMock).toHaveBeenCalledWith(
      'error',
      'Failed to fetch AAP job templates',
      {
        name: 'Error',
        message: 'Request failed with status code 401',
        stack: expect.any(String),
      },
    );
    expect(logMock).toHaveBeenCalledWith(
      'debug',
      'Discovered ResourceEntity "demoWorkflowJobTemplate"',
    );
  });
});
