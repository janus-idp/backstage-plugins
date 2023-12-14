import React from 'react';

import { Table, WarningPanel } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';

import { Card, CardContent, makeStyles } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';

import { policyEntityUpdatePermission } from '@janus-idp/backstage-plugin-rbac-common';

import { useMembers } from '../../hooks/useMembers';
import { MembersData } from '../../types';
import { getKindNamespaceName, getMembers } from '../../utils/rbac-utils';
import EditRole from '../EditRole';
import { columns } from './MembersListColumns';

type MembersCardProps = {
  roleName: string;
};

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

const getRefreshIcon = () => <CachedIcon />;
const getEditIcon = (isAllowed: boolean, roleName: string) => {
  const { kind, name, namespace } = getKindNamespaceName(roleName);

  return (
    <EditRole
      dataTestId={isAllowed ? 'update-members' : 'disable-update-members'}
      roleName={roleName}
      disable={!isAllowed}
      to={`/rbac/role/${kind}/${namespace}/${name}?activeStep=${1}`}
    />
  );
};

export const MembersCard = ({ roleName }: MembersCardProps) => {
  const { data, loading, retry, error } = useMembers(roleName);
  const [members, setMembers] = React.useState<MembersData[]>();
  const permissionResult = usePermission({
    permission: policyEntityUpdatePermission,
    resourceRef: policyEntityUpdatePermission.resourceType,
  });

  const classes = useStyles();
  const actions = [
    {
      icon: getRefreshIcon,
      tooltip: 'Refresh',
      isFreeAction: true,
      onClick: () => retry(),
    },
    {
      icon: () => getEditIcon(permissionResult.allowed, roleName),
      tooltip: !permissionResult.allowed ? 'Unauthorized to edit' : 'Edit',
      isFreeAction: true,
      onClick: () => {},
    },
  ];

  const onSearchResultsChange = (searchResults: MembersData[]) => {
    setMembers(searchResults);
  };

  return (
    <Card>
      <CardContent>
        {!loading && error && (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={(error as Error)?.message || (error as Error)?.name}
              title="Something went wrong while fetching the users and groups"
              severity="error"
            />
          </div>
        )}
        <Table
          title={
            !loading && data?.length
              ? `Users and groups (${getMembers(members || data)})`
              : 'Users and groups'
          }
          actions={actions}
          renderSummaryRow={summary => onSearchResultsChange(summary.data)}
          options={{ padding: 'default', search: true, paging: true }}
          data={data ?? []}
          isLoading={loading}
          columns={columns}
          emptyContent={
            <div data-testid="members-table-empty" className={classes.empty}>
              No records found
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};
