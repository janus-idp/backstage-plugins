import { IdentityApi } from '@backstage/core-plugin-api';

import { ArgoCDApiClient } from '..';
import { mockApplication } from '../../../dev/__data__';

export const getIdentityApiStub: IdentityApi = {
  getProfileInfo: jest.fn(),
  getBackstageIdentity: jest.fn(),
  async getCredentials() {
    return { token: 'fake-jwt-token' };
  },
  signOut: jest.fn(),
};

describe('API calls', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('listApps', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      );
    });

    test('fetches app based on provided projectName', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'http://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.listApps({
        url: '',
        projectName: 'test',
        appNamespace: 'my-test-ns',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api/argocd/applications?project=test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });
    test('fetches app based on provided appSelector', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'http://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.listApps({
        url: '',
        appSelector: 'my-test-app-selector',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api/argocd/applications/selector/my-test-app-selector?selector=my-test-app-selector',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });

    test('Should throw error incase of any internal API failure', async () => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: false,
          status: 'Internal server error',
          statusText: 'Something went wrong',
          json: () => Promise.reject({ status: 'Internal server error' }),
        } as unknown as Response),
      );

      const client = new ArgoCDApiClient({
        backendBaseUrl: 'http://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      try {
        await client.listApps({
          url: '',
          appSelector: 'my-test-app-selector',
        });
      } catch (error: any) {
        expect(error.message).toBe(
          'failed to fetch data, status Internal server error: Something went wrong',
        );
      }
    });

    test('should not pass the token for the guest user', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'http://test.com',
        useNamespacedApps: false,
        identityApi: {
          ...getIdentityApiStub,
          getCredentials: async () => {
            return {};
          },
        },
      });

      await client.listApps({
        url: '',
        projectName: 'test',
        appNamespace: 'my-test-ns',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api/argocd/applications?project=test',
        expect.objectContaining({
          headers: undefined,
        }),
      );
    });
  });

  describe('getRevisionDetails', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      );
    });

    test('should return the revision details', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'http://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.getRevisionDetails({
        instanceName: 'main',
        app: 'my-test-app',
        revisionID: '12345',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api/argocd/argoInstance/main/applications/name/my-test-app/revisions/12345/metadata',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });
  });

  describe('getRevisionDetailsList', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve<Response>({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      );
    });

    test('should return empty list if the revisionIds are not passed', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'http://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      const data = await client.getRevisionDetailsList({
        instanceName: 'main',
        apps: [mockApplication],
        revisionIDs: [],
        appNamespace: '',
      });
      expect(data).toHaveLength(0);
    });

    test('should return the list of revision details', async () => {
      const client = new ArgoCDApiClient({
        backendBaseUrl: 'http://test.com',
        useNamespacedApps: false,
        identityApi: getIdentityApiStub,
      });

      await client.getRevisionDetailsList({
        instanceName: 'main',
        apps: [mockApplication],
        revisionIDs: ['90f9758b7033a4bbb7c33a35ee474d61091644bc'],
        appNamespace: '',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/api/argocd/argoInstance/main/applications/name/quarkus-app-dev/revisions/90f9758b7033a4bbb7c33a35ee474d61091644bc/metadata',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer fake-jwt-token`,
          },
        }),
      );
    });
  });
});
