import React from 'react';

import { Table } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { useRoles } from '../../hooks/useRoles';
import { RolesData } from '../../types';
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
  const { loading, data, retry, createRoleAllowed } = useRoles();

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
      <Snackbar
        open={toastMessage !== ''}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ width: '100%' }}
        style={{ top: '100px', right: '20px' }}
        onClose={onAlertClose}
      >
        <Alert
          onClose={onAlertClose}
          severity="info"
          variant="filled"
          icon={false}
          sx={{ width: '60%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
      <RolesListToolbar createRoleAllowed={createRoleAllowed} />
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
