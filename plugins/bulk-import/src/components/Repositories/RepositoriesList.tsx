import React from 'react';

import { ErrorPage, Table } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';

import { useAddedRepositories } from '../../hooks/useAddedRepositories';
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
  const [pageNumber, setPageNumber] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [isMounted, setIsMounted] = React.useState(false);
  const classes = useStyles();

  const {
    data: importJobs,
    error: errJobs,
    loading: loadingJobs,
  } = useAddedRepositories(pageNumber + 1, rowsPerPage);

  React.useEffect(() => {
    if (!isMounted && !loadingJobs) {
      setIsMounted(true);
    }
  }, [loadingJobs, isMounted]);

  if (errJobs) {
    return <ErrorPage status={errJobs.name} statusMessage={errJobs.message} />;
  }

  return (
    <>
      <RepositoriesListToolbar />
      <Table
        onPageChange={(page: number, pageSize: number) => {
          setPageNumber(page);
          setRowsPerPage(pageSize);
        }}
        onRowsPerPageChange={(pageSize: number) => {
          setRowsPerPage(pageSize);
        }}
        title={
          (loadingJobs && !isMounted) || !importJobs
            ? 'Added repositories'
            : `Added repositories (${importJobs.length})`
        }
        options={{ padding: 'default', search: true, paging: true }}
        data={importJobs ?? []}
        isLoading={loadingJobs && !isMounted}
        columns={columns}
        emptyContent={
          <div
            data-testid="added-repositories-table-empty"
            className={classes.empty}
          >
            No records found
          </div>
        }
      />
    </>
  );
};
