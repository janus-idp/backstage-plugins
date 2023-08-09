import React from 'react';

import { renderWithEffects } from '@backstage/test-utils';

import { waitFor } from '@testing-library/react';

import App from './App';

describe('App', () => {
  it('should render', async () => {
    process.env = {
      NODE_ENV: 'test',
      APP_CONFIG: [
        {
          data: {
            app: { title: 'Test' },
            backend: { baseUrl: 'http://localhost:7007' },
            techdocs: {
              storageUrl: 'http://localhost:7007/api/techdocs/static/docs',
            },
          },
          context: 'test',
        },
      ] as any,
    };

    const rendered = await renderWithEffects(<App />);
    await waitFor(async () => expect(rendered.baseElement).toBeInTheDocument());
  }, 20000);
});
