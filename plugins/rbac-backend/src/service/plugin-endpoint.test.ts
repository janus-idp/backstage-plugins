import { getVoidLogger, ReadUrlResponse } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { NotFoundError } from '@backstage/errors';

import { PluginPermissionMetadataCollector } from './plugin-endpoints';

const backendPluginIDsProviderMock = {
  getPluginIds: jest.fn().mockImplementation(() => {
    return [];
  }),
};

const config = new ConfigReader({});

const logger = getVoidLogger();

const mockUrlReaderService = {
  readUrl: jest.fn().mockImplementation(() => {}),
  readTree: jest.fn().mockImplementation(() => {}),
  search: jest.fn().mockImplementation(async () => {
    return Promise.resolve({
      files: [],
      etag: '',
    });
  }),
};

jest.mock('@backstage/backend-common', () => {
  const actualBackendCommon = jest.requireActual('@backstage/backend-common');
  actualBackendCommon.UrlReaders = {
    default: jest.fn(() => mockUrlReaderService),
  };
  return actualBackendCommon;
});

describe('plugin-endpoint', () => {
  const fakeToken = 'fakeToken';
  const mockPluginEndpointDiscovery = {
    getBaseUrl: jest.fn().mockImplementation(async (pluginId: string) => {
      return `https://localhost:7007/api/${pluginId}`;
    }),
    getExternalBaseUrl: jest.fn().mockImplementation(),
  };

  const bufferMock = {
    toString: jest.fn().mockImplementation(),
  };

  const mockReadUrlResponse: ReadUrlResponse = {
    buffer: jest.fn().mockImplementation(async () => {
      return Promise.resolve(bufferMock as any as Buffer);
    }),
  };

  beforeEach(() => {
    (mockUrlReaderService.readUrl as jest.Mock).mockReset();
  });

  describe('Test list plugin policies', () => {
    it('should return empty plugin policies list', async () => {
      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );
      const policiesMetadata = await collector.getPluginPolicies(fakeToken);

      expect(policiesMetadata.length).toEqual(0);
    });

    it('should return non empty plugin policies list', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue(['permission']);

      mockUrlReaderService.readUrl.mockReturnValue(mockReadUrlResponse);
      bufferMock.toString.mockReturnValueOnce(
        '{"permissions":[{"type":"resource","name":"policy.entity.read","attributes":{"action":"read"},"resourceType":"policy-entity"}]}',
      );

      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );
      const policiesMetadata = await collector.getPluginPolicies(fakeToken);

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('permission');
      expect(policiesMetadata[0].policies).toEqual([
        {
          permission: 'policy-entity',
          policy: 'read',
        },
        {
          permission: 'policy.entity.read',
          policy: 'read',
        },
      ]);
    });

    it('should return plugin policies list without resource type permissions', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue(['permission']);

      mockUrlReaderService.readUrl.mockReturnValue(mockReadUrlResponse);
      bufferMock.toString.mockReturnValueOnce(
        '{"permissions":[{"type":"resource","name":"policy.entity.read","attributes":{"action":"read"}}]}',
      );

      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );
      const policiesMetadata = await collector.getPluginPolicies(fakeToken);

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('permission');
      expect(policiesMetadata[0].policies).toEqual([
        {
          permission: 'policy.entity.read',
          policy: 'read',
        },
      ]);
    });

    it('should skip not found error for not found endpoint', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue([
        'permission',
        'unknown-plugin-id',
      ]);

      mockUrlReaderService.readUrl = jest
        .fn()
        .mockImplementation(async (wellKnownURL: string) => {
          if (
            wellKnownURL ===
            'https://localhost:7007/api/permission/.well-known/backstage/permissions/metadata'
          ) {
            return mockReadUrlResponse;
          }
          throw new NotFoundError();
        });
      bufferMock.toString.mockReturnValueOnce(
        '{"permissions":[{"type":"resource","name":"policy.entity.read","attributes":{"action":"read"}}]}',
      );

      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );
      const policiesMetadata = await collector.getPluginPolicies(fakeToken);

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('permission');
      expect(policiesMetadata[0].policies).toEqual([
        {
          permission: 'policy.entity.read',
          policy: 'read',
        },
      ]);
    });

    it('should log error when it is not possible to retrieve permission metadata for known endpoint', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue([
        'permission',
        'catalog',
      ]);

      mockUrlReaderService.readUrl = jest
        .fn()
        .mockImplementation(async (wellKnownURL: string) => {
          if (
            wellKnownURL ===
            'https://localhost:7007/api/permission/.well-known/backstage/permissions/metadata'
          ) {
            return mockReadUrlResponse;
          }
          throw new Error('Unexpected error');
        });
      bufferMock.toString.mockReturnValueOnce(
        '{"permissions":[{"type":"resource","name":"policy.entity.read","attributes":{"action":"read"}}]}',
      );

      const errorSpy = jest.spyOn(logger, 'error').mockClear();
      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );

      const policiesMetadata = await collector.getPluginPolicies(fakeToken);

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('permission');
      expect(policiesMetadata[0].policies).toEqual([
        {
          permission: 'policy.entity.read',
          policy: 'read',
        },
      ]);

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to retrieve permission metadata for catalog. Error: Unexpected error',
      );
    });

    it('should not log error caused by non json permission metadata for known endpoint', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue([
        'permission',
        'catalog',
      ]);

      mockUrlReaderService.readUrl = jest
        .fn()
        .mockImplementation(async (_wellKnownURL: string) => {
          return mockReadUrlResponse;
        });
      bufferMock.toString
        .mockReturnValueOnce(
          '{"permissions":[{"type":"resource","name":"policy.entity.read","attributes":{"action":"read"}}]}',
        )
        .mockReturnValueOnce('non json data');

      const errorSpy = jest.spyOn(logger, 'error').mockClear();

      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );
      const policiesMetadata = await collector.getPluginPolicies(fakeToken);

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('permission');
      expect(policiesMetadata[0].policies).toEqual([
        {
          permission: 'policy.entity.read',
          policy: 'read',
        },
      ]);

      // workaround for https://issues.redhat.com/browse/RHIDP-1456
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Test list plugin condition rules', () => {
    it('should return empty condition rule list', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue([]);

      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );
      const conditionRulesMetadata =
        await collector.getPluginConditionRules(fakeToken);

      expect(conditionRulesMetadata.length).toEqual(0);
    });

    it('should return non empty condition rule list', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue(['catalog']);

      mockUrlReaderService.readUrl.mockReturnValue(mockReadUrlResponse);
      bufferMock.toString.mockReturnValueOnce(
        '{"rules": [{"description":"Allow entities with the specified label","name":"HAS_LABEL","paramsSchema":{"$schema":"http://json-schema.org/draft-07/schema#","additionalProperties":false,"properties":{"label":{"description":"Name of the label to match on","type":"string"}},"required":["label"],"type":"object"},"resourceType":"catalog-entity"}]}',
      );

      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );
      const conditionRulesMetadata =
        await collector.getPluginConditionRules(fakeToken);

      expect(conditionRulesMetadata.length).toEqual(1);
      expect(conditionRulesMetadata[0].pluginId).toEqual('catalog');
      expect(conditionRulesMetadata[0].rules).toEqual([
        {
          description: 'Allow entities with the specified label',
          name: 'HAS_LABEL',
          paramsSchema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            additionalProperties: false,
            properties: {
              label: {
                description: 'Name of the label to match on',
                type: 'string',
              },
            },
            required: ['label'],
            type: 'object',
          },
          resourceType: 'catalog-entity',
        },
      ]);
    });
  });

  describe('Test get plugin metadata by id', () => {
    it('should return metadata by id', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue(['catalog']);

      mockUrlReaderService.readUrl.mockReturnValue(mockReadUrlResponse);
      bufferMock.toString.mockReturnValueOnce(
        '{"permissions":[{"type":"resource","name":"catalog.entity.read","attributes":{"action":"read"},"resourceType":"catalog-entity"}], "rules": [{"description":"Allow entities with the specified label","name":"HAS_LABEL","paramsSchema":{"$schema":"http://json-schema.org/draft-07/schema#","additionalProperties":false,"properties":{"label":{"description":"Name of the label to match on","type":"string"}},"required":["label"],"type":"object"},"resourceType":"catalog-entity"}]}',
      );

      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        logger,
        config,
      );
      const metadata = await collector.getMetadataByPluginId(
        'catalog',
        undefined,
      );

      expect(metadata).not.toBeUndefined();
      expect(metadata?.permissions).toEqual([
        {
          name: 'catalog.entity.read',
          attributes: { action: 'read' },
          type: 'resource',
          resourceType: 'catalog-entity',
        },
      ]);
      expect(metadata!.rules).toEqual([
        {
          description: 'Allow entities with the specified label',
          name: 'HAS_LABEL',
          paramsSchema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            additionalProperties: false,
            properties: {
              label: {
                description: 'Name of the label to match on',
                type: 'string',
              },
            },
            required: ['label'],
            type: 'object',
          },
          resourceType: 'catalog-entity',
        },
      ]);
    });
  });
});
