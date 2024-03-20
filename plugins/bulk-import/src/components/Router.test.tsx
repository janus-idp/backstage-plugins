import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import { Router } from './Router';

jest.mock('./BulkImportPage', () => ({
  BulkImportPage: () => <div>Bulk Import</div>,
}));

jest.mock('./AddRepositories/AddRepositoriesPage', () => ({
  AddRepositoriesPage: () => <div>Add Repositories</div>,
}));

describe('Router component', () => {
  it('renders BulkImportPage when path is "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Router />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Bulk Import')).toBeInTheDocument();
  });

  it('renders Add repositories page when path matches addRepositoriesRouteRef', () => {
    render(
      <MemoryRouter initialEntries={['/add']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Add Repositories')).toBeInTheDocument();
  });
});
