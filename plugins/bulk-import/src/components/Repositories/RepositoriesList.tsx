import React from 'react';

import { Table } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';

import { RepositoriesData } from '../../types';
import { columns } from './RepositoriesListColumns';
import { RepositoriesListToolbar } from './RepositoriesListToolbar';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const RepositoriesList = () => {
  const classes = useStyles();
  const data: RepositoriesData[] = [];

  return (
    <>
      <RepositoriesListToolbar />
      <Table
        title="Added repositories (0)"
        options={{ padding: 'default', search: true, paging: true }}
        data={data}
        isLoading={false}
        columns={columns}
        emptyContent={
          <div data-testid="repositories-table-empty" className={classes.empty}>
            No records found
          </div>
        }
      />
    </>
  );
};
