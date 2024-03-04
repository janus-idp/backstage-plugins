import { mockServices, startTestBackend } from '@backstage/backend-test-utils';

import request from 'supertest';

import { bulkImportPlugin } from './plugin';

describe('bulkImportPlugin test', () => {
  it('can access verify the router is up from the /health endpoint', async () => {
    const fakeConfig = { myPlugin: { value: 7 } };
    const { server } = await startTestBackend({
      features: [
        bulkImportPlugin(),
        mockServices.rootConfig.factory({ data: fakeConfig }),
        mockServices.rootLogger.factory(),
      ],
    });

    const response = await request(server).get('/api/bulk-import/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
