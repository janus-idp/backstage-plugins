import React from 'react';

import { renderWithEffects } from '@backstage/test-utils';

import { removeScalprum } from '@scalprum/core';
import { mockPluginData } from '@scalprum/react-test-utils';
import { waitFor } from '@testing-library/react';

import { AppBase } from './App';
import TestRoot from './utils/test/TestRoot';

describe('App', () => {
  beforeEach(() => {
    removeScalprum();
  });

  it('should render', async () => {
    const { TestScalprumProvider } = mockPluginData({
      url: 'http://localhost:7007/foo/bar.json',
      module: 'UserSettings',
      pluginManifest: {
        baseURL: 'http://localhost:7007',
        extensions: [],
        name: 'janus.dynamic-frontend-plugin',
        loadScripts: [],
        version: '1.0.0',
        registrationMethod: 'custom',
      },
    });
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

    const rendered = await renderWithEffects(
      <TestScalprumProvider>
        <TestRoot>
          <AppBase />
        </TestRoot>
      </TestScalprumProvider>,
    );
    await waitFor(async () => expect(rendered.baseElement).toBeInTheDocument());
  });
});
