import type {
  SchedulerServiceTaskInvocationDefinition,
  SchedulerServiceTaskRunner,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { ErrorLike } from '@backstage/errors';
import type { EntityProviderConnection } from '@backstage/plugin-catalog-node';

import {
  listJobTemplates,
  listWorkflowJobTemplates,
} from '../clients/AapResourceConnector';
import { AapResourceEntityProvider } from './AapResourceEntityProvider';

const AUTH_HEADER = 'Bearer xxxx'; // NOSONAR

const CONFIG = {
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

class SchedulerServiceTaskRunnerMock implements SchedulerServiceTaskRunner {
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

const scheduler = mockServices.scheduler.mock({
  createScheduledTaskRunner() {
    return new SchedulerServiceTaskRunnerMock();
  },
});

describe('AapResourceEntityProvider', () => {
  let schedule: SchedulerServiceTaskRunnerMock;

  beforeEach(() => {
    jest.clearAllMocks();
    schedule = scheduler.createScheduledTaskRunner(
      '' as unknown as SchedulerServiceTaskScheduleDefinition,
    ) as SchedulerServiceTaskRunnerMock;
  });

  it('should connect', async () => {
    const aap = AapResourceEntityProvider.fromConfig(
      mockServices.rootConfig({ data: CONFIG }),
      {
        logger: mockServices.logger.mock(),
        schedule,
      },
    );

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

    const aap = AapResourceEntityProvider.fromConfig(
      mockServices.rootConfig({ data: CONFIG }),
      {
        logger: mockServices.logger.mock(),
        schedule,
      },
    );

    for await (const k of aap) {
      await k.connect(connection);
      await schedule.runAll();
    }

    expect(connection.applyMutation).toHaveBeenCalledTimes(1);
    expect(
      (connection.applyMutation as jest.Mock).mock.calls,
    ).toMatchSnapshot();
  });

  it('should connect and run should resolves even if one api call fails', async () => {
    const error = new Error('Request failed with status code 401') as ErrorLike;
    error.config = {
      header: {
        authorization: AUTH_HEADER,
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

    // every aap provider automatically creates a new logger
    const aapLogger = mockServices.logger.mock();
    const logger = mockServices.logger.mock({
      child() {
        return aapLogger;
      },
    });

    const aap = AapResourceEntityProvider.fromConfig(
      mockServices.rootConfig({ data: CONFIG }),
      {
        logger,
        schedule,
      },
    );

    for await (const k of aap) {
      await k.connect(connection);
      await schedule.runAll();
    }

    expect(logger.child).toHaveBeenCalledTimes(1);

    expect(connection.applyMutation).toHaveBeenCalledTimes(1);
    expect(
      (connection.applyMutation as jest.Mock).mock.calls,
    ).toMatchSnapshot();

    expect(aapLogger.info).toHaveBeenCalledWith(
      'Discovering ResourceEntities from AAP http://localhost:8080',
    );
    expect(aapLogger.error).toHaveBeenCalledWith(
      'Failed to fetch AAP job templates',
      {
        name: 'Error',
        message: 'Request failed with status code 401',
        stack: expect.any(String),
      },
    );
    expect(aapLogger.debug).toHaveBeenCalledWith(
      'Discovered ResourceEntity "demoWorkflowJobTemplate"',
    );
  });
});
