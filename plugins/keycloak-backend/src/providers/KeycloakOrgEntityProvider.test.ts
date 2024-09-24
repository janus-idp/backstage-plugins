import type {
  LoggerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { mockServices, ServiceMock } from '@backstage/backend-test-utils';
import { ErrorLike } from '@backstage/errors';

// @ts-ignore
import inclusion from 'inclusion';

import {
  assertLogMustNotInclude,
  authMock,
  CONFIG,
  connection,
  KeycloakAdminClientMockServerv18,
  KeycloakAdminClientMockServerv24,
  scheduler,
} from '../../__fixtures__/helpers';
import type { SchedulerServiceTaskRunnerMock } from '../../__fixtures__/helpers';
import { KeycloakOrgEntityProvider } from './KeycloakOrgEntityProvider';

jest.mock('inclusion', () => jest.fn());

describe.each([
  ['v24', KeycloakAdminClientMockServerv24],
  ['v18', KeycloakAdminClientMockServerv18],
])('KeycloakOrgEntityProvider with %s', (_version, mockImplementation) => {
  let logger: ServiceMock<LoggerService>;
  let keycloakLogger: ServiceMock<LoggerService>;
  let schedule: SchedulerServiceTaskRunnerMock;

  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockReset();
    keycloakLogger = mockServices.logger.mock();
    logger = mockServices.logger.mock({
      child() {
        return keycloakLogger;
      },
    });
    jest.mock('inclusion', () => jest.fn());
    (inclusion as jest.Mock).mockImplementation(() => {
      return { default: mockImplementation }; // Return the correct mock based on the version
    });
    schedule = scheduler.createScheduledTaskRunner(
      '' as unknown as SchedulerServiceTaskScheduleDefinition,
    ) as SchedulerServiceTaskRunnerMock;
  });
  afterEach(() => {
    for (const log of [logger, keycloakLogger]) {
      assertLogMustNotInclude(log, ['myclientsecret', 'mypassword']); // NOSONAR
    }
  });

  it('should mock inclusion', async () => {
    const KeyCloakAdminClient = await inclusion(
      '@keycloak/keycloak-admin-client',
    );
    expect(KeyCloakAdminClient).toEqual({ default: mockImplementation });
  });

  it('should connect', async () => {
    const keycloak = KeycloakOrgEntityProvider.fromConfig(
      {
        config: mockServices.rootConfig({ data: CONFIG }),
        logger,
      },
      {
        schedule,
      },
    );

    const result = await Promise.all(
      keycloak.map(async k => await k.connect(connection)),
    );
    expect(result).toEqual([undefined]);
  });

  it('should not read without a connection', async () => {
    const keycloak = KeycloakOrgEntityProvider.fromConfig(
      {
        config: mockServices.rootConfig({ data: CONFIG }),
        logger,
      },
      {
        schedule,
      },
    );

    for await (const k of keycloak) {
      await expect(() => k.read()).rejects.toThrow('Not initialized');
    }
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should fail with grantType client_credential, but without client secret', async () => {
    const config = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              clientId: 'myclientid',
            },
          },
        },
      },
    };

    expect(() =>
      KeycloakOrgEntityProvider.fromConfig(
        {
          config: mockServices.rootConfig({ data: config }),
          logger,
        },
        {
          schedule,
        },
      ),
    ).toThrow('clientSecret must be provided when clientId is defined.');
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should read with grantType client_credential', async () => {
    const config = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              clientId: 'myclientid',
              clientSecret: 'myclientsecret',
            },
          },
        },
      },
    };

    const keycloak = KeycloakOrgEntityProvider.fromConfig(
      {
        config: mockServices.rootConfig({ data: config }),
        logger,
      },
      {
        schedule,
      },
    );

    for await (const k of keycloak) {
      await k.connect(connection);
      await schedule.runAll();
    }

    expect(authMock).toHaveBeenCalledTimes(1);
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'client_credentials',
      clientId: 'myclientid',
      clientSecret: 'myclientsecret',
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(1);
    expect(
      (connection.applyMutation as jest.Mock).mock.calls,
    ).toMatchSnapshot();
  });

  it('should fail read with grantType username, but without password', async () => {
    const config = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              username: 'myusername',
            },
          },
        },
      },
    };

    expect(() =>
      KeycloakOrgEntityProvider.fromConfig(
        {
          config: mockServices.rootConfig({ data: config }),
          logger,
        },
        {
          schedule,
        },
      ),
    ).toThrow('password must be provided when username is defined.');
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should read with grantType password', async () => {
    const config = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              username: 'myusername',
              password: 'mypassword', // NOSONAR
            },
          },
        },
      },
    };

    const keycloak = KeycloakOrgEntityProvider.fromConfig(
      {
        config: mockServices.rootConfig({ data: config }),
        logger,
      },
      {
        schedule,
      },
    );

    for await (const k of keycloak) {
      await k.connect(connection);
      await schedule.runAll();
    }

    expect(authMock).toHaveBeenCalledTimes(1);
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(1);
    expect(
      (connection.applyMutation as jest.Mock).mock.calls,
    ).toMatchSnapshot();
  });

  it('should log a proper error when network connection was refused', async () => {
    // Create an error that contains sensitive information.
    // The afterEach call ensure that this information aren't logged.
    const error = new Error('connect ECONNREFUSED ::1:8080') as ErrorLike;
    error.code = 'ECONNREFUSED';
    error.config = {
      data: 'username=myusername&password=mypassword', // NOSONAR
    };
    error.status = null;
    authMock.mockRejectedValue(error);

    const config = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              username: 'myusername',
              password: 'mypassword', // NOSONAR
            },
          },
        },
      },
    };

    const keycloak = KeycloakOrgEntityProvider.fromConfig(
      {
        config: mockServices.rootConfig({ data: config }),
        logger,
      },
      {
        schedule,
      },
    );

    for await (const k of keycloak) {
      await k.connect(connection);
      await schedule.runAll();
    }

    expect(authMock).toHaveBeenCalledTimes(1);
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(0);

    expect(logger.child).toHaveBeenCalledTimes(1);
    expect(keycloakLogger.info).toHaveBeenCalledWith(
      'Reading Keycloak users and groups',
    );
    expect(keycloakLogger.error).toHaveBeenCalledWith(
      'Error while syncing Keycloak users and groups',
      {
        name: 'Error',
        message: 'connect ECONNREFUSED ::1:8080',
        stack: expect.any(String),
      },
    );
  });

  it('should log a proper error when network connection was forbidden', async () => {
    // Create an error that contains sensitive information.
    // The afterEach call ensure that this information aren't logged.
    const error = new Error('Request failed with status code 401') as ErrorLike;
    error.config = {
      data: 'username=myusername&password=mypassword', // NOSONAR
    };
    error.status = 401;
    authMock.mockRejectedValue(error);

    const config = {
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080',
              username: 'myusername',
              password: 'mypassword', // NOSONAR
            },
          },
        },
      },
    };

    const keycloak = KeycloakOrgEntityProvider.fromConfig(
      {
        config: mockServices.rootConfig({ data: config }),
        logger,
      },
      {
        schedule,
      },
    );

    for await (const k of keycloak) {
      await k.connect(connection);
      await schedule.runAll();
    }

    expect(authMock).toHaveBeenCalledTimes(1);
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(0);

    expect(logger.child).toHaveBeenCalledTimes(1);
    expect(keycloakLogger.info).toHaveBeenCalledWith(
      'Reading Keycloak users and groups',
    );
    expect(keycloakLogger.error).toHaveBeenCalledWith(
      'Error while syncing Keycloak users and groups',
      {
        name: 'Error',
        message: 'Request failed with status code 401',
        stack: expect.any(String),
      },
    );
  });
});
