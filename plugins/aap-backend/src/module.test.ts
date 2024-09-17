import type { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import catalogPlugin from '@backstage/plugin-catalog-backend/alpha';
import type { EntityProvider } from '@backstage/plugin-catalog-node';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

import { catalogModuleAapResourceEntityProvider } from './module';

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

describe('catalogModuleAapResourceEntityProvider', () => {
  it('should return an empty array for AAP if no providers are configured', async () => {
    let addedProviders: EntityProvider[] | EntityProvider[][] | undefined;
    const extensionPoint = {
      addEntityProvider: (
        ...providers: EntityProvider[] | EntityProvider[][]
      ) => {
        addedProviders = providers;
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleAapResourceEntityProvider,
        mockServices.rootConfig.factory({ data: {} }),
      ],
    });

    // Only the AAP provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);

    // AAP returns an array of entity providers
    expect((addedProviders as EntityProvider[][])[0].length).toEqual(0);
  });

  it('should not run without a authorization', async () => {
    await expect(
      startTestBackend({
        features: [
          catalogPlugin,
          catalogModuleAapResourceEntityProvider,
          mockServices.rootConfig.factory({
            data: {
              catalog: {
                providers: {
                  aap: {
                    dev: {
                      baseUrl: 'http://localhost:8080',
                    },
                  },
                },
              },
            },
          }),
        ],
      }),
    ).rejects.toThrow(
      "Missing required config value at 'catalog.providers.aap.dev.authorization",
    );
  });

  it('should return a single provider with the default schedule', async () => {
    let usedSchedule: SchedulerServiceTaskScheduleDefinition | undefined;
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner(schedule) {
        usedSchedule = schedule;
        return { run: runner };
      },
    });

    await startTestBackend({
      features: [
        catalogPlugin,
        catalogModuleAapResourceEntityProvider,
        mockServices.rootConfig.factory({ data: CONFIG }),
        scheduler.factory,
      ],
    });

    expect(usedSchedule?.frequency).toEqual({ minutes: 30 });
    expect(usedSchedule?.timeout).toEqual({ minutes: 3 });
  });

  it('should return a single provider with a specified schedule', async () => {
    let usedSchedule: SchedulerServiceTaskScheduleDefinition | undefined;
    const runner = jest.fn();
    const scheduler = mockServices.scheduler.mock({
      createScheduledTaskRunner(schedule) {
        usedSchedule = schedule;
        return { run: runner };
      },
    });

    await startTestBackend({
      features: [
        catalogPlugin,
        catalogModuleAapResourceEntityProvider,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              providers: {
                aap: {
                  dev: {
                    baseUrl: 'http://localhost:8080',
                    authorization: AUTH_HEADER,
                    schedule: {
                      frequency: 'P1M',
                      timeout: 'PT5M',
                    },
                  },
                },
              },
            },
          },
        }),
        scheduler.factory,
      ],
    });

    expect(usedSchedule?.frequency).toEqual({ months: 1 });
    expect(usedSchedule?.timeout).toEqual({ minutes: 5 });
  });

  it('should return multiple providers', async () => {
    let addedProviders: EntityProvider[] | EntityProvider[][] | undefined;
    const extensionPoint = {
      addEntityProvider: (
        ...providers: EntityProvider[] | EntityProvider[][]
      ) => {
        addedProviders = providers;
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleAapResourceEntityProvider,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              providers: {
                aap: {
                  dev: {
                    baseUrl: 'http://localhost:8080',
                    authorization: AUTH_HEADER,
                  },
                  production: {
                    baseUrl: 'http://localhost:8080',
                    authorization: AUTH_HEADER,
                  },
                },
              },
            },
          },
        }),
      ],
    });

    // Only the AAP provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);

    // AAP returns an array of entity providers
    expect((addedProviders as EntityProvider[][])[0].length).toEqual(2);
  });

  it('should return provider name', async () => {
    let addedProviders: EntityProvider[] | EntityProvider[][] | undefined;
    const extensionPoint = {
      addEntityProvider: (
        ...providers: EntityProvider[] | EntityProvider[][]
      ) => {
        addedProviders = providers;
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleAapResourceEntityProvider,
        mockServices.rootConfig.factory({
          data: CONFIG,
        }),
      ],
    });

    // Only the AAP provider should be in the array
    expect((addedProviders as EntityProvider[][]).length).toEqual(1);

    // AAP returns an array of entity providers
    expect(
      (addedProviders as EntityProvider[][])[0][0].getProviderName(),
    ).toEqual('AapResourceEntityProvider:dev');
  });
});
