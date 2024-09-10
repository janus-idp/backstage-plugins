import React from 'react';

import { Progress, Table, WarningPanel } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';

import { useDeleteDialog } from '@janus-idp/shared-react';

import { useCheckIfLicensePluginEnabled } from '../../hooks/useCheckIfLicensePluginEnabled';
import { useLocationToast } from '../../hooks/useLocationToast';
import { useRoles } from '../../hooks/useRoles';
import { RolesData } from '../../types';
import DownloadCSVLink from '../DownloadUserStatistics';
import { SnackbarAlert } from '../SnackbarAlert';
import { useToast } from '../ToastContext';
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
  const { openDialog, setOpenDialog, deleteComponent } = useDeleteDialog();
  useLocationToast(setToastMessage);
  const [roles, setRoles] = React.useState<number | undefined>();
  const classes = useStyles();
  const { loading, data, retry, createRoleAllowed, createRoleLoading, error } =
    useRoles();

  const closeDialog = () => {
    setOpenDialog(false);
    retry.roleRetry();
    retry.policiesRetry();
  };

  const onAlertClose = () => {
    setToastMessage('');
  };
  const onSearchResultsChange = (searchResults: RolesData[]) => {
    setRoles(searchResults.length);
  };

  const getErrorWarning = () => {
    const errorTitleBase = 'Something went wrong while fetching the';
    const errorWarningArr = [
      { message: error?.rolesError, title: `${errorTitleBase} roles` },
      {
        message: error?.policiesError,
        title: `${errorTitleBase} permission policies`,
      },
      {
        message: error?.roleConditionError,
        title: `${errorTitleBase} role conditions`,
      },
    ];

    return (
      errorWarningArr.find(({ message }) => message) || {
        message: '',
        title: '',
      }
    );
  };

  const errorWarning = getErrorWarning();

  const isLicensePluginEnabled = useCheckIfLicensePluginEnabled();
  if (isLicensePluginEnabled.loading) {
    return <Progress />;
  }

  return (
    <>
      <SnackbarAlert toastMessage={toastMessage} onAlertClose={onAlertClose} />
      <RolesListToolbar
        createRoleAllowed={createRoleAllowed}
        createRoleLoading={createRoleLoading}
      />
      {errorWarning.message && (
        <div style={{ paddingBottom: '16px' }}>
          <WarningPanel
            message={errorWarning.message}
            title={errorWarning.title}
            severity="error"
          />
        </div>
      )}
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
      {isLicensePluginEnabled.isEnabled && <DownloadCSVLink />}
      {openDialog && (
        <DeleteRoleDialog
          open={openDialog}
          closeDialog={closeDialog}
          roleName={deleteComponent.roleName}
          propOptions={{
            memberRefs:
              data.find(d => d.name === deleteComponent.roleName)?.members ||
              [],
            permissions:
              data.find(d => d.name === deleteComponent.roleName)
                ?.permissions || 0,
          }}
        />
      )}
    </>
  );
};
