import React from 'react';

import { Table } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';

import { useRoles } from '../../hooks/useRoles';
import { RolesData } from '../../types';
import { SnackbarAlert } from '../SnackbarAlert';
import { useToast } from '../ToastContext';
import { useDeleteDialog } from './DeleteDialogContext';
import DeleteRoleDialog from './DeleteRoleDialog';
import { columns } from './RolesListColumns';
import { RolesListToolbar } from './RolesListToolbar';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const RolesList = () => {
  const { toastMessage, setToastMessage } = useToast();
  const { openDialog, setOpenDialog, deleteRoleName } = useDeleteDialog();

  const [roles, setRoles] = React.useState<number | undefined>();
  const classes = useStyles();
  const { loading, data, retry, createRoleAllowed, createRoleLoading } =
    useRoles();

  const closeDialog = () => {
    setOpenDialog(false);
    retry();
  };

  const onAlertClose = () => {
    setToastMessage('');
  };
  const onSearchResultsChange = (searchResults: RolesData[]) => {
    setRoles(searchResults.length);
  };

  return (
    <>
      <SnackbarAlert toastMessage={toastMessage} onAlertClose={onAlertClose} />
      <RolesListToolbar
        createRoleAllowed={createRoleAllowed}
        createRoleLoading={createRoleLoading}
      />
      <Table
        title={
          !loading && data?.length
            ? `All roles (${roles ?? data.length})`
            : `All roles`
        }
        options={{ padding: 'default', search: true, paging: true }}
        data={data}
        isLoading={loading}
        columns={columns}
        renderSummaryRow={summary => onSearchResultsChange(summary.data)}
        emptyContent={
          <div data-testid="roles-table-empty" className={classes.empty}>
            No records found
          </div>
        }
      />
      {openDialog && (
        <DeleteRoleDialog
          open={openDialog}
          closeDialog={closeDialog}
          roleName={deleteRoleName}
          propOptions={{
            memberRefs:
              data.find(d => d.name === deleteRoleName)?.members || [],
            permissions:
              data.find(d => d.name === deleteRoleName)?.permissions || 0,
          }}
        />
      )}
    </>
  );
};
