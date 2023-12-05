import React from 'react';

import { Link, TableColumn } from '@backstage/core-components';

import { RolesData } from '../types';
import { getMembers } from '../utils/rbac-utils';
import DeleteRole from './DeleteRole';

export const columns: TableColumn<RolesData>[] = [
  {
    title: 'Name',
    field: 'name',
    type: 'string',
    render: (props: RolesData) => (
      <Link to={`roles/${props.name}`}>{props.name}</Link>
    ),
  },
  {
    title: 'Users and groups',
    field: 'members',
    type: 'string',
    align: 'left',
    render: props => getMembers(props.members),
    customSort: (a, b) => {
      if (a.members.length === 0) {
        return -1;
      }
      if (b.members.length === 0) {
        return 1;
      }
      if (a.members.length === b.members.length) {
        return 0;
      }
      return a.members.length < b.members.length ? -1 : 1;
    },
  },
  {
    title: 'Permission Policies',
    field: 'permissions',
    type: 'numeric',
    align: 'left',
  },
  {
    title: 'Actions',
    sorting: false,
    render: (props: RolesData) => (
      <DeleteRole
        dataTestId={
          !props.permissionResult.allowed
            ? 'disable-delete-role'
            : 'delete-role'
        }
        roleName={props.name}
        disable={!props.permissionResult.allowed}
        tooltip={
          !props.permissionResult.allowed ? 'Role cannot be deleted' : ''
        }
      />
    ),
  },
];
