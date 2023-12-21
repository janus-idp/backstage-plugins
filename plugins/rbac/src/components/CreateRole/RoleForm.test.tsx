import React from 'react';

import { LinkProps } from '@backstage/core-components';

import { render, screen } from '@testing-library/react';
import { useFormik } from 'formik';

import { RoleForm } from './RoleForm';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: (props: LinkProps) => (
    <a href={props.to} data-test={props.to}>
      {props.children}
    </a>
  ),
  useNavigate: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormik: jest.fn(),
}));

const useFormikMock = useFormik as jest.Mock;

describe('Create RoleForm', () => {
  it('renders create role form correctly', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {},
      // mocked useFormik to return formik status with submitError
      status: { submitError: '' },
    });
    render(
      <RoleForm
        membersData={{ members: [], loading: false, error: {} as Error }}
        roleName=""
        initialValues={{
          name: '',
          namespace: 'default',
          kind: 'role',
          description: '',
          selectedMembers: [],
          permissionPoliciesRows: [
            {
              plugin: '',
              permission: '',
              policies: [
                { label: 'Create', checked: false },
                { label: 'Read', checked: false },
                { label: 'Update', checked: false },
                { label: 'Delete', checked: false },
              ],
            },
          ],
        }}
        titles={{
          formTitle: 'Create Role',
          nameAndDescriptionTitle: 'Enter name and description of role ',
          usersAndGroupsTitle: 'Add users and groups',
          permissionPoliciesTitle: '',
        }}
      />,
    );

    expect(
      screen.getByText(/enter name and description of role/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId(/role-name/i)).toBeInTheDocument();
    expect(screen.getByTestId(/role-description/i)).toBeInTheDocument();
    expect(screen.getByText(/add users and groups/i)).toBeInTheDocument();
  });

  it('shows error if there is any error in formik status', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {},
      // mocked useFormik to return formik status with submitError
      status: { submitError: 'Unable to create role. Unexpected error' },
    });
    render(
      <RoleForm
        membersData={{ members: [], loading: false, error: {} as Error }}
        roleName=""
        initialValues={{
          name: '',
          namespace: 'default',
          kind: 'role',
          description: '',
          selectedMembers: [],
          permissionPoliciesRows: [
            {
              plugin: '',
              permission: '',
              policies: [
                { label: 'Create', checked: false },
                { label: 'Read', checked: false },
                { label: 'Update', checked: false },
                { label: 'Delete', checked: false },
              ],
            },
          ],
        }}
        titles={{
          formTitle: 'Create Role',
          nameAndDescriptionTitle: 'Enter name and description of role ',
          usersAndGroupsTitle: 'Add users and groups',
          permissionPoliciesTitle: '',
        }}
      />,
    );

    expect(
      screen.getByText(/Unable to create role. unexpected error/i),
    ).toBeInTheDocument();
  });
});

describe('Edit RoleForm', () => {
  it('renders edit role form correctly', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {},
      // mocked useFormik to return formik status with submitError
      status: { submitError: 'Unexpected error' },
    });
    render(
      <RoleForm
        membersData={{ members: [], loading: false, error: {} as Error }}
        roleName="role:default/xyz"
        initialValues={{
          name: 'xyz',
          namespace: 'default',
          kind: 'role',
          description: '',
          selectedMembers: [
            {
              ref: 'user:default/janelle.dawe',
              label: 'Janelle Dawe',
              etag: 'b027e001c70faf091869106d4e9023f7bddb9502',
              type: 'User',
              namespace: 'default',
            },
          ],
          permissionPoliciesRows: [
            {
              plugin: '',
              permission: '',
              policies: [
                { label: 'Create', checked: false },
                { label: 'Read', checked: false },
                { label: 'Update', checked: false },
                { label: 'Delete', checked: false },
              ],
            },
          ],
        }}
        titles={{
          formTitle: 'Edit Role',
          nameAndDescriptionTitle: 'Edit name and description of role ',
          usersAndGroupsTitle: 'Edit users and groups',
          permissionPoliciesTitle: '',
        }}
      />,
    );

    expect(
      screen.getByText(/edit name and description of role/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId(/role-name/i)).toBeInTheDocument();
    expect(screen.getByTestId(/role-description/i)).toBeInTheDocument();
    expect(screen.getByText(/edit users and groups/i)).toBeInTheDocument();
  });

  it('renders edit role form correctly with edit users and groups stepper active', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {
        selectedMembers: [
          {
            ref: 'user:default/janelle.dawe',
            label: 'Janelle Dawe',
            etag: 'b027e001c70faf091869106d4e9023f7bddb9502',
            type: 'User',
            namespace: 'default',
          },
        ],
      },
      // mocked useFormik to return formik status with submitError
      status: { submitError: 'Unexpected error' },
    });
    render(
      <RoleForm
        step={1}
        membersData={{
          members: [
            {
              metadata: {
                namespace: 'default',
                annotations: {},
                name: 'janelle.dawe',
                uid: '00a6a3c6-329c-4c0e-8ffb-ce2a16782d24',
                etag: 'fb0eb7d5de1eb7d7bfd92c10ac5508623c7286b8',
              },
              apiVersion: 'backstage.io/v1alpha1',
              kind: 'User',
              spec: {
                profile: {
                  displayName: 'Janelle Dawe',
                },
                memberOf: ['team-d'],
              },
              relations: [],
            },
            {
              metadata: {
                namespace: 'default',
                annotations: {},
                name: 'lucy.sheehan',
                uid: '00a6a3c6-329c-4c0e-8ffb-ce2a16782d24',
                etag: 'fb0eb7d5de1eb7d7bfd92c10ac5508623c7286b8',
              },
              apiVersion: 'backstage.io/v1alpha1',
              kind: 'User',
              spec: {
                profile: {
                  displayName: 'Lucy Sheehan',
                },
                memberOf: ['team-d'],
              },
              relations: [],
            },
          ],
          loading: false,
          error: {} as Error,
        }}
        roleName="role:default/xyz"
        initialValues={{
          name: 'xyz',
          namespace: 'default',
          kind: 'role',
          description: '',
          selectedMembers: [
            {
              ref: 'user:default/janelle.dawe',
              label: 'Janelle Dawe',
              etag: 'b027e001c70faf091869106d4e9023f7bddb9502',
              type: 'User',
              namespace: 'default',
            },
          ],
          permissionPoliciesRows: [
            {
              plugin: '',
              permission: '',
              policies: [
                { label: 'Create', checked: false },
                { label: 'Read', checked: false },
                { label: 'Update', checked: false },
                { label: 'Delete', checked: false },
              ],
            },
          ],
        }}
        titles={{
          formTitle: 'Edit Role',
          nameAndDescriptionTitle: 'Edit name and description of role ',
          usersAndGroupsTitle: 'Edit users and groups',
          permissionPoliciesTitle: '',
        }}
      />,
    );

    expect(screen.getByText(/edit users and groups/i)).toBeInTheDocument();
    expect(screen.getByText(/janelle dawe/i)).toBeInTheDocument();
  });

  it('shows error if there is any error in formik status', async () => {
    useFormikMock.mockReturnValue({
      errors: {},
      values: {
        selectedMembers: [
          {
            ref: 'user:default/janelle.dawe',
            label: 'Janelle Dawe',
            etag: 'b027e001c70faf091869106d4e9023f7bddb9502',
            type: 'User',
            namespace: 'default',
          },
        ],
      },
      // mocked useFormik to return formik status with submitError
      status: { submitError: 'Unable to edit the role. Unexpected error' },
    });
    render(
      <RoleForm
        membersData={{ members: [], loading: false, error: {} as Error }}
        roleName="role:default/xyz"
        initialValues={{
          name: 'xyz',
          namespace: 'default',
          kind: 'role',
          description: '',
          selectedMembers: [],
          permissionPoliciesRows: [
            {
              plugin: '',
              permission: '',
              policies: [
                { label: 'Create', checked: false },
                { label: 'Read', checked: false },
                { label: 'Update', checked: false },
                { label: 'Delete', checked: false },
              ],
            },
          ],
        }}
        titles={{
          formTitle: 'Edit Role',
          nameAndDescriptionTitle: 'Edit name and description of role ',
          usersAndGroupsTitle: 'Edit users and groups',
          permissionPoliciesTitle: '',
        }}
      />,
    );

    expect(
      screen.getByText(/unable to edit the role. unexpected error/i),
    ).toBeInTheDocument();
  });
});
