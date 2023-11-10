import React from 'react';

import {
  renderInTestApp,
  setupRequestMockHandlers,
} from '@backstage/test-utils';

import { screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { RbacPage } from './RbacPage';

describe('RbacPage', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  setupRequestMockHandlers(server);

  // setup mock response
  beforeEach(() => {
    server.use(
      rest.get('/*', (_, res, ctx) => res(ctx.status(200), ctx.json({}))),
    );
  });

  it('should render', async () => {
    await renderInTestApp(<RbacPage />);
    expect(screen.getByText('Administration')).toBeInTheDocument();
  });
});
