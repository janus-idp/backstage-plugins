import React from 'react';

import { Table, WarningPanel } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';

import { Card, CardContent, makeStyles } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';

import { policyEntityUpdatePermission } from '@janus-idp/backstage-plugin-rbac-common';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { PermissionsData } from '../../types';
import { getKindNamespaceName } from '../../utils/rbac-utils';
import EditRole from '../EditRole';
import { columns } from './PermissionsListColumns';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

type PermissionsCardProps = {
  entityReference: string;
};

const getRefreshIcon = () => <CachedIcon />;
const getEditIcon = (isAllowed: boolean, roleName: string) => {
  const { kind, name, namespace } = getKindNamespaceName(roleName);

  return (
    <EditRole
      dataTestId={isAllowed ? 'update-policies' : 'disable-update-policies'}
      roleName={roleName}
      disable={!isAllowed}
      to={`/rbac/role/${kind}/${namespace}/${name}?activeStep=${2}`}
    />
  );
};

export const PermissionsCard = ({ entityReference }: PermissionsCardProps) => {
  const { data, loading, retry, error } =
    usePermissionPolicies(entityReference);
  const [permissions, setPermissions] = React.useState<PermissionsData[]>();
  const permissionResult = usePermission({
    permission: policyEntityUpdatePermission,
    resourceRef: policyEntityUpdatePermission.resourceType,
  });
  const classes = useStyles();

  const onSearchResultsChange = (searchResults: PermissionsData[]) => {
    setPermissions(searchResults);
  };

  let numberOfPolicies = 0;
  (permissions || data)?.forEach(p => {
    numberOfPolicies =
      numberOfPolicies +
      p.policies.filter(pol => pol.effect === 'allow').length;
  });
  const actions = [
    {
      icon: getRefreshIcon,
      tooltip: 'Refresh',
      isFreeAction: true,
      onClick: () => retry(),
    },
    {
      icon: () => getEditIcon(permissionResult.allowed, entityReference),
      tooltip: !permissionResult.allowed ? 'Unauthorized to edit' : 'Edit',
      isFreeAction: true,
      onClick: () => {},
    },
  ];

  return (
    <Card>
      <CardContent>
        {error?.name && (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={error?.message}
              title="Something went wrong while fetching the permission policies"
              severity="error"
            />
          </div>
        )}
        <Table
          title={
            !loading && data?.length
              ? `Permission Policies (${numberOfPolicies})`
              : 'Permission Policies'
          }
          actions={actions}
          renderSummaryRow={summary => onSearchResultsChange(summary.data)}
          options={{ padding: 'default', search: true, paging: true }}
          data={data ?? []}
          columns={columns}
          isLoading={loading}
          emptyContent={
            <div data-testid="permission-table-empty" className={classes.empty}>
              No records found
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};
