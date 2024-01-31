import React from 'react';

import { Link, TableColumn } from '@backstage/core-components';

import { MembersData } from '../../types';

export const columns: TableColumn<MembersData>[] = [
  {
    title: 'Name',
    field: 'name',
    type: 'string',
    render: props => {
      return (
        <Link
          to={`/catalog/${props.ref.namespace}/${props.ref.kind}/${props.ref.name}`}
        >
          {props.name}
        </Link>
      );
    },
  },
  {
    title: 'Type',
    field: 'type',
    type: 'string',
  },
  {
    title: 'Members',
    field: 'members',
    type: 'numeric',
    align: 'left',
    render: (props: MembersData) => {
      return props.type === 'User' ? '-' : props.members;
    },
    customSort: (a, b) => {
      if (a.members === 0) {
        return -1;
      }
      if (b.members === 0) {
        return 1;
      }
      if (a.members === b.members) {
        return 0;
      }
      return a.members < b.members ? -1 : 1;
    },
  },
];
