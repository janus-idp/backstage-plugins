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
  const [addedRepositories, setAddedRepositories] = React.useState<
    number | undefined
  >();
  const data: RepositoriesData[] = [];

  const onSearchResultsChange = (searchResults: RepositoriesData[]) => {
    setAddedRepositories(searchResults.length);
  };

  return (
    <>
      <RepositoriesListToolbar />
      <Table
        title={`Added repositories (${addedRepositories ?? data.length})`}
        options={{ padding: 'default', search: true, paging: true }}
        data={data}
        isLoading={false}
        renderSummaryRow={summary => onSearchResultsChange(summary.data)}
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
