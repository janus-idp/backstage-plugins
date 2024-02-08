import React from 'react';

import { Link, TableColumn } from '@backstage/core-components';

import { IconButton } from '@material-ui/core';
import Delete from '@mui/icons-material/Delete';
import { FormikErrors } from 'formik';

import { getKindNamespaceName } from '../../utils/rbac-utils';
import { RoleFormValues, SelectedMember } from './types';

export const reviewStepMemebersTableColumns = () => [
  {
    title: 'Name',
    field: 'label',
    type: 'string',
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
    render: (mem: number) => {
      if (mem || mem === 0) return mem;
      return '-';
    },
  },
];

export const selectedMembersColumns = (
  selectedMembers: SelectedMember[],
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>,
): TableColumn<SelectedMember>[] => {
  const onRemove = (etag: string) => {
    const updatedMembers = selectedMembers.filter(
      (mem: SelectedMember) => mem.etag !== etag,
    );
    setFieldValue('selectedMembers', updatedMembers);
  };

  return [
    {
      title: 'Name',
      field: 'label',
      type: 'string',
      render: props => {
        const { kind, namespace, name } = getKindNamespaceName(props.ref);
        return (
          <Link to={`/catalog/${namespace}/${kind}/${name}`} target="blank">
            {props.label}
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
      emptyValue: '-',
    },
    {
      title: 'Actions',
      sorting: false,
      render: (mem: SelectedMember) => {
        return (
          <span key={mem.etag}>
            <IconButton
              onClick={() => onRemove(mem.etag)}
              aria-label="Remove"
              title="Remove member"
            >
              <Delete />
            </IconButton>
          </span>
        );
      },
    },
  ];
};
