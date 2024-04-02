import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import EditRole from './EditRole';

jest.mock('../utils/rbac-utils', () => ({
  getKindNamespaceName: jest
    .fn()
    .mockReturnValue({ name: 'roleName', namespace: 'default', kind: 'Role' }),
}));

describe('EditRole', () => {
  it('renders the button as disabled when disable is true', () => {
    render(
      <Router>
        <EditRole roleName="roleName" disable dataTestId="edit-role-btn" />
      </Router>,
    );

    expect(screen.getByRole('button', { name: 'Update' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('renders the button with correct tooltip and enabled state', () => {
    const tooltipText = 'Edit Role Tooltip';
    render(
      <Router>
        <EditRole
          roleName="roleName"
          disable={false}
          dataTestId="edit-role-btn"
          tooltip={tooltipText}
        />
      </Router>,
    );

    expect(screen.getByTestId('edit-role-btn')).toHaveAttribute(
      'title',
      tooltipText,
    );
    expect(screen.getByRole('button', { name: 'Update' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
  });

  it('sets the correct link path when "to" prop is provided', () => {
    const toPath = '/custom/path';
    render(
      <Router>
        <EditRole
          roleName="roleName"
          disable={false}
          dataTestId="edit-role-btn"
          to={toPath}
        />
      </Router>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('href', toPath);
  });

  it('sets the correct default link path based on roleName', () => {
    render(
      <Router>
        <EditRole
          roleName="roleName"
          disable={false}
          dataTestId="edit-role-btn"
        />
      </Router>,
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'href',
      expect.stringContaining('/role/Role/default/roleName'),
    );
  });
});
