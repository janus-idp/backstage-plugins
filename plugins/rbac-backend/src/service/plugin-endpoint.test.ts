import { getVoidLogger, ReadUrlResponse } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

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

  describe('Test list plugin policies', () => {
    it('should return empty plugin policies list', async () => {
      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        config,
        logger,
      );
      const policiesMetadata = await collector.getPluginPolicies();

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
        config,
        logger,
      );
      const policiesMetadata = await collector.getPluginPolicies();

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('permission');
      expect(policiesMetadata[0].policies).toEqual([
        {
          permission: 'policy-entity',
          policy: 'read',
        },
      ]);
    });
  });

  describe('Test list plugin condition rules', () => {
    it('should return empty condition rule list', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue([]);

      const collector = new PluginPermissionMetadataCollector(
        mockPluginEndpointDiscovery,
        backendPluginIDsProviderMock,
        config,
        logger,
      );
      const conditionRulesMetadata = await collector.getPluginConditionRules();

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
        config,
        logger,
      );
      const conditionRulesMetadata = await collector.getPluginConditionRules();

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
});
