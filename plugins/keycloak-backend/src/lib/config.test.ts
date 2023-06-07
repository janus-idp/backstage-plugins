import * as backendTasks from '@backstage/backend-tasks';
import { Config } from '@backstage/config';

import { readProviderConfigs } from './config';

jest
  .spyOn(backendTasks, 'readTaskScheduleDefinitionFromConfig')
  .mockReturnValue({
    frequency: { hours: 1 },
    timeout: { minutes: 50 },
    initialDelay: { seconds: 15 },
  } as backendTasks.TaskScheduleDefinition);

const exampleProviderConfigInstance = {
  has: jest.fn().mockReturnValueOnce(false),
  getConfig: jest.fn().mockReturnValueOnce(undefined),
  getString: jest.fn().mockReturnValueOnce('http://localhost:8080/auth'),
  getOptionalString: jest.fn().mockReturnValue(undefined),
  getOptionalNumber: jest.fn().mockReturnValue(undefined),
};

describe('readProviderConfigs', () => {
  it('should return an empty array if no providers are configured', () => {
    const config = {
      getOptionalConfig: jest.fn().mockReturnValue(undefined),
    } as unknown as Config;

    const result = readProviderConfigs(config);

    expect(result).toEqual([]);
  });

  it('should return an array of provider configs', () => {
    const config = {
      getOptionalConfig: jest.fn().mockReturnValue({
        keys: jest.fn().mockReturnValue(['default']),
        getConfig: jest.fn().mockReturnValue(exampleProviderConfigInstance),
      }),
    } as unknown as Config;

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
    const config = {
      getOptionalConfig: jest.fn().mockReturnValue({
        keys: jest.fn().mockReturnValue(['default']),
        getConfig: jest.fn().mockReturnValue({
          ...exampleProviderConfigInstance,
          has: jest.fn().mockReturnValueOnce(true),
          getOptionalString: jest
            .fn()
            .mockReturnValueOnce('myrealm')
            .mockReturnValueOnce('myloginrealm')
            .mockReturnValueOnce('myusername')
            .mockReturnValueOnce('mypassword')
            .mockReturnValueOnce('myclientid')
            .mockReturnValueOnce('myclientsecret'),
          getOptionalNumber: jest
            .fn()
            .mockReturnValueOnce(100)
            .mockReturnValueOnce(200),
        }),
      }),
    } as unknown as Config;

    const result = readProviderConfigs(config);

    expect(result).toEqual([
      {
        id: 'default',
        baseUrl: undefined,
        loginRealm: 'myloginrealm',
        realm: 'myrealm',
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
    ]);
  });

  it('should throw an error if clientId is provided without clientSecret', () => {
    const config = {
      getOptionalConfig: jest.fn().mockReturnValue({
        keys: jest.fn().mockReturnValue(['default']),
        getConfig: jest.fn().mockReturnValue({
          ...exampleProviderConfigInstance,
          getOptionalString: jest
            .fn()
            .mockReturnValueOnce('myrealm')
            .mockReturnValueOnce('myloginrealm')
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce('myclientid')
            .mockReturnValueOnce(undefined),
        }),
      }),
    } as unknown as Config;

    expect(() => readProviderConfigs(config)).toThrow(
      `clientSecret must be provided when clientId is defined.`,
    );
  });

  it('should throw an error if clientSecret is provided without clientId', () => {
    const config = {
      getOptionalConfig: jest.fn().mockReturnValue({
        keys: jest.fn().mockReturnValue(['default']),
        getConfig: jest.fn().mockReturnValue({
          ...exampleProviderConfigInstance,
          getOptionalString: jest
            .fn()
            .mockReturnValueOnce('myrealm')
            .mockReturnValueOnce('myloginrealm')
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce('myclientsecret'),
        }),
      }),
    } as unknown as Config;

    expect(() => readProviderConfigs(config)).toThrow(
      `clientId must be provided when clientSecret is defined.`,
    );
  });

  it('should throw an error if username is provided without password', () => {
    const config = {
      getOptionalConfig: jest.fn().mockReturnValue({
        keys: jest.fn().mockReturnValue(['default']),
        getConfig: jest.fn().mockReturnValue({
          ...exampleProviderConfigInstance,
          getOptionalString: jest
            .fn()
            .mockReturnValueOnce('myrealm')
            .mockReturnValueOnce('myloginrealm')
            .mockReturnValueOnce('myusername')
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined),
        }),
      }),
    } as unknown as Config;

    expect(() => readProviderConfigs(config)).toThrow(
      `password must be provided when username is defined.`,
    );
  });

  it('should throw an error if password is provided without username', () => {
    const config = {
      getOptionalConfig: jest.fn().mockReturnValue({
        keys: jest.fn().mockReturnValue(['default']),
        getConfig: jest.fn().mockReturnValue({
          ...exampleProviderConfigInstance,
          getOptionalString: jest
            .fn()
            .mockReturnValueOnce('myrealm')
            .mockReturnValueOnce('myloginrealm')
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce('mypassword')
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined),
        }),
      }),
    } as unknown as Config;

    expect(() => readProviderConfigs(config)).toThrow(
      `username must be provided when password is defined.`,
    );
  });
});
