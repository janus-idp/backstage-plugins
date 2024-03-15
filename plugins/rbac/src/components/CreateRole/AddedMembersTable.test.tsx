import React from 'react';

import { Table } from '@backstage/core-components';

import { render, screen } from '@testing-library/react';

import { AddedMembersTable } from './AddedMembersTable';
import { SelectedMember } from './types';

const setFieldValueMock = jest.fn();

const selectedMembers: SelectedMember[] = [
  {
    id: 'test-1',
    label: 'User 1',
    etag: 'etag-1',
    type: 'User',
    ref: 'role/:user/:testns1/:testuser1',
  },
  {
    id: 'test-2',
    label: 'Group 1',
    etag: 'etag-2',
    type: 'Group',
    ref: 'role/:group/testns1/testgroup1',
  },
];

jest.mock('@backstage/core-components');
const mockedTable = Table as jest.MockedFunction<typeof Table>;
mockedTable.mockImplementation(
  jest.requireActual('@backstage/core-components').Table,
);

describe('AddedMembersTable component', () => {
  it('renders with empty content when no selected members', () => {
    render(
      <AddedMembersTable
        selectedMembers={[]}
        setFieldValue={setFieldValueMock}
      />,
    );

    expect(screen.queryByText('Users and groups')).toBeInTheDocument();
    expect(
      screen.queryByText('No records. Selected users and groups appear here.'),
    ).toBeInTheDocument();
  });

  it('renders with selected members and correct title', () => {
    render(
      <AddedMembersTable
        selectedMembers={selectedMembers}
        setFieldValue={setFieldValueMock}
      />,
    );

    expect(mockedTable).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Users and groups (1 user, 1 group)',
        data: selectedMembers,
      }),
      expect.anything(),
    );
  });
});
