import React from 'react';

import { Table, WarningPanel } from '@backstage/core-components';

import { Card, CardContent, makeStyles } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';
import { get } from 'lodash';

import { useMembers } from '../hooks/useMembers';
import { MembersData } from '../types';
import { getMembers } from '../utils/rbac-utils';
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

export const MembersCard = ({ roleName }: MembersCardProps) => {
  const { data, loading, retry, error } = useMembers(roleName);
  const [members, setMembers] = React.useState<MembersData[]>();

  const classes = useStyles();

  const onSearchResultsChange = (searchResults: MembersData[]) => {
    setMembers(searchResults);
  };

  return (
    <Card>
      <CardContent>
        {!loading && error && (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={
                get(error, 'statusText') ||
                get(error, 'message') ||
                get(error, 'name')
              }
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
          renderSummaryRow={summary => onSearchResultsChange(summary.data)}
          actions={[
            {
              icon: getRefreshIcon,
              tooltip: 'Refresh',
              isFreeAction: true,
              onClick: () => retry(),
            },
          ]}
          options={{ padding: 'default', search: true, paging: true }}
          data={data ?? []}
          isLoading={loading}
          columns={columns}
          emptyContent={
            <div data-testid="members-table-empty" className={classes.empty}>
              No users and groups found
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};
