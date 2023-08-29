import { getVoidLogger } from '@backstage/backend-common';
import { TaskRunner } from '@backstage/backend-tasks';
import { ConfigReader } from '@backstage/config';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';

import {
  listJobTemplates,
  listWorkflowJobTemplates,
} from '../clients/AapResourceConnector';
import { AapResourceEntityProvider } from './AapResourceEntityProvider';

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
          authorization: 'Bearer xxxx',
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

describe('AapResourceEntityProvider', () => {
  beforeEach(() => {
    (listJobTemplates as jest.Mock).mockClear();
    (listWorkflowJobTemplates as jest.Mock).mockClear();
  });

  it('should return an empty array if no providers are configured', () => {
    const config = new ConfigReader({});

    const result = AapResourceEntityProvider.fromConfig(config, {
      logger: getVoidLogger(),
    });

    expect(result).toEqual([]);
  });

  it('should not run without a authorization', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    expect(() =>
      AapResourceEntityProvider.fromConfig(config, {
        logger: getVoidLogger(),
      }),
    ).toThrow(
      "Missing required config value at 'catalog.providers.aap.dev.authorization",
    );
  });

  it('should not run without a valid schedule', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);

    expect(() =>
      AapResourceEntityProvider.fromConfig(config, {
        logger: getVoidLogger(),
      }),
    ).toThrow(
      'No schedule provided neither via code nor config for AapResourceEntityProvider:dev.',
    );
  });

  it('should return a single provider if one is configured', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);
    const aap = AapResourceEntityProvider.fromConfig(config, {
      logger: getVoidLogger(),
      schedule: {} as TaskRunner,
    });

    expect(aap).toHaveLength(1);
  });

  it('should return provider name', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);

    const aap = AapResourceEntityProvider.fromConfig(config, {
      logger: getVoidLogger(),
      schedule: {} as TaskRunner,
    });

    expect(aap.map(k => k.getProviderName())).toEqual([
      'AapResourceEntityProvider:dev',
    ]);
  });

  it('should connect', async () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG_2);

    const aap = AapResourceEntityProvider.fromConfig(config, {
      logger: getVoidLogger(),
      schedule: { run: jest.fn() } as TaskRunner,
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
      logger: getVoidLogger(),
      schedule: { run: jest.fn() } as TaskRunner,
    });

    for await (const k of aap) {
      await k.connect(connection);
      await expect(k.run()).resolves.toBeUndefined();
    }
  });

  it('should connect and run should resolves even if one api call fails', async () => {
    (listJobTemplates as jest.Mock).mockReturnValue(
      Promise.reject(new Error('404')),
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
      logger: getVoidLogger(),
      schedule: { run: jest.fn() } as TaskRunner,
    });

    for await (const k of aap) {
      await k.connect(connection);
      await expect(k.run()).resolves.toBeUndefined();
    }
  });
});
