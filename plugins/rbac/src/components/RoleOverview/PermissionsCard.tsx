import React from 'react';

import { Table, WarningPanel } from '@backstage/core-components';

import { Card, CardContent, makeStyles } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { PermissionsData } from '../../types';
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

export const PermissionsCard = ({ entityReference }: PermissionsCardProps) => {
  const { data, loading, retry, error } =
    usePermissionPolicies(entityReference);
  const [permissions, setPermissions] = React.useState<PermissionsData[]>();
  const classes = useStyles();

  const onSearchResultsChange = (searchResults: PermissionsData[]) => {
    setPermissions(searchResults);
  };

  let numberOfPolicies = 0;
  (permissions || data)?.forEach(p => {
    numberOfPolicies = numberOfPolicies + p.policies.size;
  });
  const actions = [
    {
      icon: getRefreshIcon,
      tooltip: 'Refresh',
      isFreeAction: true,
      onClick: () => retry(),
    },
  ];

  return (
    <Card>
      <CardContent>
        {error && (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={
                (error as Response)?.statusText ||
                (error as Error)?.message ||
                (error as Error)?.name
              }
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
