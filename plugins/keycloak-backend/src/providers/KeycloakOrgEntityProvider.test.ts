import { ConfigReader } from '@backstage/config';

import {
  assertLogMustNotInclude,
  authMock,
  BASIC_VALID_CONFIG,
  connection,
  createLogger,
  KeycloakAdminClientMock,
  logMock,
  ManualTaskRunner,
} from '../../__fixtures__/helpers';
import { KeycloakOrgEntityProvider } from './KeycloakOrgEntityProvider';

jest.mock('@keycloak/keycloak-admin-client', () => {
  const actual = jest.requireActual('@keycloak/keycloak-admin-client');
  return {
    ...actual,
    default: KeycloakAdminClientMock,
  };
});

describe('KeycloakOrgEntityProvider', () => {
  const logger = createLogger();

  // Steps to run the user and group sync similar to a scheduled job:
  // 1. Schedule a task with k.schedule(manualTaskRunner)
  // 2. Open the connection with k.connect() that automatically append a task to that task runner
  // 3. Run the tasks with manualTaskRunner.runAll() that starts the read from keycloak
  const manualTaskRunner = new ManualTaskRunner();

  beforeEach(() => {
    jest.resetAllMocks();
    manualTaskRunner.clear();
  });

  afterEach(() => {
    assertLogMustNotInclude(['myclientsecret', 'mypassword']); // NOSONAR
  });

  it('should return an empty array if no providers are configured', () => {
    const config = new ConfigReader({});

    const result = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
    });

    expect(result).toEqual([]);
  });

  it('should not run without a valid schedule', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    expect(() =>
      KeycloakOrgEntityProvider.fromConfig(config, {
        id: 'development',
        logger,
      }),
    ).toThrow(
      'No schedule provided neither via code nor config for KeycloakOrgEntityProvider:default.',
    );
  });

  it('should return a single provider if one is configured', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    });

    expect(keycloak).toHaveLength(1);
  });

  it('should return provider name', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    });

    expect(keycloak.map(k => k.getProviderName())).toEqual([
      'KeycloakOrgEntityProvider:default',
    ]);
  });

  it('should connect', async () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    });

    const result = await Promise.all(
      keycloak.map(async k => await k.connect(connection)),
    );
    expect(result).toEqual([undefined]);
  });

  it('should not read without a connection', async () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    });

    for await (const k of keycloak) {
      await expect(() => k.read()).rejects.toThrow('Not initialized');
    }
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should fail with grantType client_credential, but without client secret', async () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080/auth',
              clientId: 'myclientid',
            },
          },
        },
      },
    });

    expect(() =>
      KeycloakOrgEntityProvider.fromConfig(config, {
        id: 'development',
        logger,
        schedule: 'manual',
      }),
    ).toThrow('clientSecret must be provided when clientId is defined.');
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should read with grantType client_credential', async () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080/auth',
              clientId: 'myclientid',
              clientSecret: 'myclientsecret',
            },
          },
        },
      },
    });

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    });

    for await (const k of keycloak) {
      k.schedule(manualTaskRunner);
      await k.connect(connection);
      await manualTaskRunner.runAll();
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
    const config = new ConfigReader({
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080/auth',
              username: 'myusername',
            },
          },
        },
      },
    });

    expect(() =>
      KeycloakOrgEntityProvider.fromConfig(config, {
        id: 'development',
        logger,
        schedule: 'manual',
      }),
    ).toThrow('password must be provided when username is defined.');
    expect(authMock).toHaveBeenCalledTimes(0);
  });

  it('should read with grantType password', async () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080/auth',
              username: 'myusername',
              password: 'mypassword', // NOSONAR
            },
          },
        },
      },
    });

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    });

    for await (const k of keycloak) {
      k.schedule(manualTaskRunner);
      await k.connect(connection);
      await manualTaskRunner.runAll();
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
    const error: Error & { code?: string; config?: any; status?: null } =
      new Error('connect ECONNREFUSED ::1:8080');
    error.code = 'ECONNREFUSED';
    error.config = {
      data: 'username=myusername&password=mypassword', // NOSONAR
    };
    error.status = null;
    authMock.mockRejectedValue(error);

    const config = new ConfigReader({
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080/auth',
              username: 'myusername',
              password: 'mypassword', // NOSONAR
            },
          },
        },
      },
    });

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    });

    for await (const k of keycloak) {
      k.schedule(manualTaskRunner);
      await k.connect(connection);
      await manualTaskRunner.runAll();
    }

    expect(authMock).toHaveBeenCalledTimes(1);
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(0);

    expect(logMock).toHaveBeenCalledWith(
      'info',
      'Reading Keycloak users and groups',
    );
    expect(logMock).toHaveBeenCalledWith(
      'error',
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
    const error: Error & { config?: any; status?: number } = new Error(
      'Request failed with status code 401',
    );
    error.config = {
      data: 'username=myusername&password=mypassword', // NOSONAR
    };
    error.status = 401;
    authMock.mockRejectedValue(error);

    const config = new ConfigReader({
      catalog: {
        providers: {
          keycloakOrg: {
            default: {
              baseUrl: 'http://localhost:8080/auth',
              username: 'myusername',
              password: 'mypassword', // NOSONAR
            },
          },
        },
      },
    });

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger,
      schedule: 'manual',
    });

    for await (const k of keycloak) {
      k.schedule(manualTaskRunner);
      await k.connect(connection);
      await manualTaskRunner.runAll();
    }

    expect(authMock).toHaveBeenCalledTimes(1);
    expect(authMock).toHaveBeenCalledWith({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'myusername',
      password: 'mypassword', // NOSONAR
    });
    expect(connection.applyMutation).toHaveBeenCalledTimes(0);

    expect(logMock).toHaveBeenCalledWith(
      'info',
      'Reading Keycloak users and groups',
    );
    expect(logMock).toHaveBeenCalledWith(
      'error',
      'Error while syncing Keycloak users and groups',
      {
        name: 'Error',
        message: 'Request failed with status code 401',
        stack: expect.any(String),
      },
    );
  });
});
