import React from 'react';

import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import {
  renderInTestApp,
  setupRequestMockHandlers,
} from '@backstage/test-utils';

import { screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { RbacPage } from './RbacPage';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
  RequirePermission: jest.fn(),
}));
const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

const RequirePermissionMock = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

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

  it('should render if authorized', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    await renderInTestApp(<RbacPage />);
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(
      screen.getByText('All content should be wrapped in a card like this.'),
    ).toBeTruthy();
  });

  it('should not render if not authorized', async () => {
    RequirePermissionMock.mockImplementation(_props => <>Not Found</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    await renderInTestApp(<RbacPage />);
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('should not render if loading', async () => {
    RequirePermissionMock.mockImplementation(_props => null);
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    const { queryByText } = await renderInTestApp(<RbacPage />);
    expect(queryByText('Not Found')).not.toBeInTheDocument();
    expect(queryByText('Administration')).not.toBeInTheDocument();
  });
});
