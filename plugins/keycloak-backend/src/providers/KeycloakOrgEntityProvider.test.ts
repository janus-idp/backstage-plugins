import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import {
  BASIC_VALID_CONFIG,
  client,
  connection,
} from '../../__fixtures__/helpers';
import { KeycloakOrgEntityProvider } from './KeycloakOrgEntityProvider';

jest.mock('@keycloak/keycloak-admin-client', () => {
  const actual = jest.requireActual('@keycloak/keycloak-admin-client');
  return {
    ...actual,
    default: jest.fn().mockImplementation(() => client),
  };
});

describe('KeycloakOrgEntityProvider', () => {
  it('should return an empty array if no providers are configured', () => {
    const config = new ConfigReader({});

    const result = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger: getVoidLogger(),
    });

    expect(result).toEqual([]);
  });

  it('should return a single provider if one is configured', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger: getVoidLogger(),
      schedule: 'manual',
    });

    expect(keycloak).toHaveLength(1);
  });

  it('should return provider name', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger: getVoidLogger(),
      schedule: 'manual',
    });

    expect(keycloak.map(k => k.getProviderName())).toEqual([
      'KeycloakOrgEntityProvider:default',
    ]);
  });

  it('should connect', () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger: getVoidLogger(),
      schedule: 'manual',
    });

    const result = keycloak.map(async k => await k.connect(connection));

    expect(result).toHaveLength(1);
  });

  it('should not read without a connection', async () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger: getVoidLogger(),
      schedule: 'manual',
    });

    keycloak.forEach(
      async k => await expect(k.read()).rejects.toThrow(`Not initialized`),
    );
  });

  it('should read with grantType client_credential', async () => {
    const config = new ConfigReader(BASIC_VALID_CONFIG);

    const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
      id: 'development',
      logger: getVoidLogger(),
      schedule: 'manual',
    });

    await keycloak.forEach(async k => {
      await k.connect(connection);
      await expect(k.read()).resolves.toBeUndefined();
    });
  });

  // TODO: We need to remock the '@keycloak/keycloak-admin-client' module to test this
  // eslint-disable-next-line jest/no-commented-out-tests
  // it('should read with grantType password', async () => {
  //   const config = new ConfigReader({
  //     catalog: {
  //       providers: {
  //         keycloakOrg: {
  //           default: {
  //             baseUrl: 'http://localhost:8080/auth',
  //             username: 'myusername',
  //             password: 'mypassword',
  //           },
  //         },
  //       },
  //     },
  //   });

  //   const keycloak = KeycloakOrgEntityProvider.fromConfig(config, {
  //     id: 'development',
  //     logger: getVoidLogger(),
  //     schedule: 'manual',
  //   });

  //   await keycloak.forEach(async k => {
  //     await k.connect(connection);
  //     await expect(k.read()).resolves.toBeUndefined();
  //   });
  // });
});
