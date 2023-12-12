import React from 'react';

import { render, screen } from '@testing-library/react';

import { CreateRoleForm } from './CreateRoleForm';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormik: jest.fn().mockReturnValue({
    errors: {},
    values: {},
    // mocked useFormik to return formik status with submitError
    status: { submitError: 'Unexpected error' },
  }),
}));

describe('CreateRoleForm', () => {
  it('renders create role form correctly', async () => {
    render(<CreateRoleForm />);

    expect(
      screen.getByText(/enter name and description of role/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId(/role-name/i)).toBeInTheDocument();
    expect(screen.getByTestId(/role-description/i)).toBeInTheDocument();
    expect(screen.getByText(/add users and groups/i)).toBeInTheDocument();
  });

  it('shows error if there is any error in formik status', async () => {
    render(<CreateRoleForm />);

    expect(
      screen.getByText(/unable to create role. unexpected error/i),
    ).toBeInTheDocument();
  });
});
