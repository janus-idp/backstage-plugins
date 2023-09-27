import {
  getVoidLogger,
  ReadTreeResponseFactory,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';

import { BackendPluginIDsProvider } from './backend-plugin-ids-provider';
import { PluginEndpointCollector } from './plugin-endpoints';

const backendPluginIDsProviderMock = {
  getPluginIds: jest.fn().mockImplementation(() => {
    return [];
  }),
};

jest.mock('./backend-plugin-ids-provider', () => {
  return {
    BackendPluginIDsProvider: jest.fn((): Partial<BackendPluginIDsProvider> => {
      return backendPluginIDsProviderMock;
    }),
  };
});

describe('plugin-endpoint', () => {
  const mockPluginEndpointDiscovery = {
    getBaseUrl: jest.fn().mockImplementation(async (pluginId: string) => {
      return `https://localhost:7007/api/${pluginId}`;
    }),
    getExternalBaseUrl: jest.fn().mockImplementation(),
  };

  describe('Test list plugin endpoints', () => {
    it('should return empty endpoints list', async () => {
      const pluginCollector = new PluginEndpointCollector(
        mockPluginEndpointDiscovery,
      );
      const endPointList = await pluginCollector.get();

      expect(endPointList.length).toEqual(0);
    });
    it('should return non empty endpoints list', async () => {
      backendPluginIDsProviderMock.getPluginIds.mockReturnValue([
        'permission',
        'catalog',
      ]);

      const pluginCollector = new PluginEndpointCollector(
        mockPluginEndpointDiscovery,
      );
      const endPointList = await pluginCollector.get();

      expect(endPointList.length).toEqual(2);
      expect(endPointList).toContain('https://localhost:7007/api/catalog');
      expect(endPointList).toContain('https://localhost:7007/api/permission');
    });
  });

  describe('permission-factory', () => {
    it('should build factory object', () => {
      const urlPredicates = PluginEndpointCollector.permissionFactory({
        config: {} as Config,
        logger: getVoidLogger(),
        treeResponseFactory: {} as ReadTreeResponseFactory,
      });
      expect(urlPredicates.length).toEqual(1);
      expect(
        urlPredicates[0].predicate(new URL('https://localhost:7007')).valueOf(),
      ).toEqual(true);
    });
  });
});
