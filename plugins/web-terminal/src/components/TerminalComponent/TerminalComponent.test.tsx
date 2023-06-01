import React from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { MockConfigApi, setupRequestMockHandlers, TestApiProvider } from '@backstage/test-utils';
import { lightTheme } from '@backstage/theme';

import { ThemeProvider } from '@material-ui/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { TerminalComponent } from './TerminalComponent';

const DOMAIN_URL = 'mock-domain.com/webterminal';
const API_URL = 'https://api.cluster.com';
const NAMESPACES_URL = `${API_URL}/api/v1/namespaces`;
const NAMESPACE = 'web-terminal-service-catalog';
const WORKSPACES_URL = `${API_URL}/apis/workspace.devfile.io/v1alpha2/namespaces/${NAMESPACE}/devworkspaces`;
const CREATED_WORKSPACE_URL = `${WORKSPACES_URL}/web-terminal-c5e12`;
const entityMock = {
  metadata: {
    annotations: {
      'kubernetes.io/api-server': API_URL,
    },
    name: 'cluster',
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
};

const mockConfig = new MockConfigApi({
  webTerminal: {
    webSocketUrl: `wss://${DOMAIN_URL}`,
    restServerUrl: `https://${DOMAIN_URL}/rest`,
    defaultNamespace: NAMESPACE,
  },
});

describe('TerminalComponent', () => {
  const server = setupServer();
  const VALID_TOKEN = 'valid-token';
  const NOT_VALID_PERMISSIONS_TOKEN = 'not-valid-permissions-token';

  setupRequestMockHandlers(server);

  beforeEach(() => {
    server.use(
      rest.get(`https://${DOMAIN_URL}`, (_, res, ctx) => res(ctx.status(200))),
      rest.get(`https://${DOMAIN_URL}/rest`, (req, res, ctx) => {
        const url = req.url.searchParams.get('url');
        switch (url) {
          case NAMESPACES_URL:
            return res(ctx.status(200), ctx.json(require('./__fixtures__/getNamespaces.json')));
          case CREATED_WORKSPACE_URL:
            return res(ctx.status(200), ctx.json(require('./__fixtures__/getWorkspace.json')));
          default:
            return res(ctx.status(404), ctx.json({}));
        }
      }),
      rest.post(`https://${DOMAIN_URL}/rest`, (req, res, ctx) => {
        const url = req.url.searchParams.get('url');
        switch (url) {
          case WORKSPACES_URL:
            if (req.headers.get('Authorization') === `Bearer ${NOT_VALID_PERMISSIONS_TOKEN}`) {
              return res(ctx.status(403), ctx.json(require('./__fixtures__/invalidToken.json')));
            }
            return res(
              ctx.delay(800),
              ctx.status(200),
              ctx.json(require('./__fixtures__/createWorkspace.json')),
            );
          default:
            return res(ctx.status(404), ctx.json({}));
        }
      }),
    );
  });
  afterEach(() => {
    server.resetHandlers();
  });
  it('should render form for the Web Terminal', async () => {
    const rendered = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider apis={[[configApiRef, mockConfig]]}>
          <EntityProvider entity={entityMock}>
            <TerminalComponent />
          </EntityProvider>
        </TestApiProvider>
      </ThemeProvider>,
    );
    expect(rendered.getByText('Web Terminal')).toBeInTheDocument();
  });
  it('should start loading', async () => {
    const rendered = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider apis={[[configApiRef, mockConfig]]}>
          <EntityProvider entity={entityMock}>
            <TerminalComponent />
          </EntityProvider>
        </TestApiProvider>
      </ThemeProvider>,
    );
    const inputField = rendered.getByTestId('token-input').querySelector('input');
    if (!inputField) {
      throw new Error('Input field not found');
    }
    fireEvent.change(inputField, { target: { value: VALID_TOKEN } });
    expect(inputField.value).toBe(VALID_TOKEN);
    const submit = rendered.getByTestId('submit-token-button');
    fireEvent.click(submit);
    await waitFor(() => expect(rendered.getByTestId('progress')).toBeInTheDocument());
  });

  it('should render popup on token without valid permissions', async () => {
    const rendered = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider apis={[[configApiRef, mockConfig]]}>
          <EntityProvider entity={entityMock}>
            <TerminalComponent />
          </EntityProvider>
        </TestApiProvider>
      </ThemeProvider>,
    );
    const inputField = rendered.getByTestId('token-input').querySelector('input');
    if (!inputField) {
      throw new Error('Input field not found');
    }
    fireEvent.change(inputField, {
      target: { value: NOT_VALID_PERMISSIONS_TOKEN },
    });
    expect(inputField.value).toBe(NOT_VALID_PERMISSIONS_TOKEN);
    const submit = rendered.getByTestId('submit-token-button');
    fireEvent.click(submit);
    await waitFor(() => expect(rendered.getByTestId('namespace-picker')).toBeInTheDocument());
  });

  it('should display terminal window', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });
    const rendered = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider apis={[[configApiRef, mockConfig]]}>
          <EntityProvider entity={entityMock}>
            <TerminalComponent />
          </EntityProvider>
        </TestApiProvider>
      </ThemeProvider>,
    );
    const inputField = rendered.getByTestId('token-input').querySelector('input');
    if (!inputField) {
      throw new Error('Input field not found');
    }
    fireEvent.change(inputField, { target: { value: VALID_TOKEN } });
    expect(inputField.value).toBe(VALID_TOKEN);
    const submit = rendered.getByTestId('submit-token-button');
    fireEvent.click(submit);
    await waitFor(() => expect(rendered.getByTestId('terminal')).toBeInTheDocument());
  });
});
