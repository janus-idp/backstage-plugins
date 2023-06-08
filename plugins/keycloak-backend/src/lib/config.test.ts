import { ConfigReader } from '@backstage/config';

import deepmerge from 'deepmerge';

import { readProviderConfigs } from './config';

// jest
//   .spyOn(backendTasks, 'readTaskScheduleDefinitionFromConfig')
//   .mockReturnValue({
//     frequency: { hours: 1 },
//     timeout: { minutes: 50 },
//     initialDelay: { seconds: 15 },
//   } as backendTasks.TaskScheduleDefinition);

const BASIC_VALID_CONFIG = {
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

describe('readProviderConfigs', () => {
  it('should return an empty array if no providers are configured', () => {
    const config = new ConfigReader({});

    const result = readProviderConfigs(config);

    expect(result).toEqual([]);
  });

  it('should return an array of provider configs', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const result = readProviderConfigs(config);

    expect(result).toEqual([
      {
        id: 'default',
        baseUrl: 'http://localhost:8080/auth',
        loginRealm: 'master',
        realm: 'master',
        username: undefined,
        password: undefined,
        clientId: undefined,
        clientSecret: undefined,
        schedule: undefined,
        userQuerySize: undefined,
        groupQuerySize: undefined,
      },
    ]);
  });

  it('should return an array of provider configs with optional values', () => {
    const config = new ConfigReader(
      deepmerge(BASIC_VALID_CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                realm: 'myrealm',
                loginRealm: 'myloginrealm',
                username: 'myusername',
                password: 'mypassword',
                clientId: 'myclientid',
                clientSecret: 'myclientsecret',
                userQuerySize: 100,
                groupQuerySize: 200,
                schedule: {
                  frequency: { hours: 1 },
                  timeout: { minutes: 50 },
                  initialDelay: { seconds: 15 },
                },
              },
            },
          },
        },
      }),
    );

    const result = readProviderConfigs(config);

    expect(result).toEqual([
      {
        id: 'default',
        baseUrl: 'http://localhost:8080/auth',
        loginRealm: 'myloginrealm',
        realm: 'myrealm',
        username: 'myusername',
        password: 'mypassword',
        clientId: 'myclientid',
        clientSecret: 'myclientsecret',
        userQuerySize: 100,
        groupQuerySize: 200,
        schedule: {
          scope: undefined,
          frequency: { hours: 1 },
          timeout: { minutes: 50 },
          initialDelay: { seconds: 15 },
        },
      },
    ]);
  });

  it('should throw an error if clientId is provided without clientSecret', () => {
    const config = new ConfigReader(
      deepmerge(BASIC_VALID_CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                clientId: 'myclientid',
              },
            },
          },
        },
      }),
    );

    expect(() => readProviderConfigs(config)).toThrow(
      `clientSecret must be provided when clientId is defined.`,
    );
  });

  it('should throw an error if clientSecret is provided without clientId', () => {
    const config = new ConfigReader(
      deepmerge(BASIC_VALID_CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                clientSecret: 'myclientsecret',
              },
            },
          },
        },
      }),
    );

    expect(() => readProviderConfigs(config)).toThrow(
      `clientId must be provided when clientSecret is defined.`,
    );
  });

  it('should throw an error if username is provided without password', () => {
    const config = new ConfigReader(
      deepmerge(BASIC_VALID_CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                username: 'myusername',
              },
            },
          },
        },
      }),
    );

    expect(() => readProviderConfigs(config)).toThrow(
      `password must be provided when username is defined.`,
    );
  });

  it('should throw an error if password is provided without username', () => {
    const config = new ConfigReader(
      deepmerge(BASIC_VALID_CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                password: 'mypassword',
              },
            },
          },
        },
      }),
    );

    expect(() => readProviderConfigs(config)).toThrow(
      `username must be provided when password is defined.`,
    );
  });
});
