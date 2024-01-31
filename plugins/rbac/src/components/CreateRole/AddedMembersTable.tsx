import React from 'react';

import { Table } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import { FormikErrors } from 'formik';

import { getMembers } from '../../utils/rbac-utils';
import { selectedMembersColumns } from './AddedMembersTableColumn';
import { RoleFormValues, SelectedMember } from './types';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

type AddedMembersTableProps = {
  selectedMembers: SelectedMember[];
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>;
};

export const AddedMembersTable = ({
  selectedMembers,
  setFieldValue,
}: AddedMembersTableProps) => {
  const classes = useStyles();
  return (
    <Table
      title={
        selectedMembers.length > 0
          ? `Users and groups (${getMembers(selectedMembers)})`
          : 'Users and groups'
      }
      data={selectedMembers}
      columns={selectedMembersColumns(selectedMembers, setFieldValue)}
      emptyContent={
        <div className={classes.empty}>
          No records. Selected users and groups appear here.
        </div>
      }
    />
  );
};
