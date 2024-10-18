import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Table } from '@backstage/core-components';

import { makeStyles, TablePagination } from '@material-ui/core';

import { useDeleteDialog, useDrawer } from '@janus-idp/shared-react';

import { useAddedRepositories } from '../../hooks/useAddedRepositories';
import { AddRepositoryData, Order } from '../../types';
import { getComparator } from '../../utils/repository-utils';
import { RepositoriesHeader } from '../AddRepositories/RepositoriesHeader';
import { AddedRepositoriesTableBody } from './AddedRepositoriesTableBody';
import DeleteRepositoryDialog from './DeleteRepositoryDialog';
import EditCatalogInfo from './EditCatalogInfo';
import { RepositoriesAddLink } from './RepositoriesAddLink';
import { RepositoriesListColumns } from './RepositoriesListColumns';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const RepositoriesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();
  const queryParams = new URLSearchParams(location.search);
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>();
  const { openDialog, setOpenDialog, deleteComponent } = useDeleteDialog();
  const { openDrawer, setOpenDrawer, drawerData } = useDrawer();
  const [pageNumber, setPageNumber] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  const {
    data: importJobs,
    error: errJobs,
    loaded: jobsLoaded,
    refetch,
  } = useAddedRepositories(pageNumber + 1, rowsPerPage, debouncedSearch);

  const closeDialog = () => {
    setOpenDialog(false);
    refetch();
  };

  const closeDrawer = () => {
    queryParams.delete('repository');
    queryParams.delete('defaultBranch');
    navigate({
      pathname: location.pathname,
      search: `?${queryParams.toString()}`,
    });
    setOpenDrawer(false);
  };

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    pageNumber > 0 ? Math.max(0, rowsPerPage - importJobs.totalJobs) : 0;

  const sortedData = React.useMemo(() => {
    return [...(importJobs.addedRepositories || [])]?.sort(
      getComparator(order, orderBy as string),
    );
  }, [importJobs.addedRepositories, order, orderBy]);

  const handleSearch = (str: string) => {
    setDebouncedSearch(str);
    setPageNumber(0);
  };

  return (
    <>
      <RepositoriesAddLink />
      <Table
        data={importJobs.addedRepositories ?? []}
        columns={RepositoriesListColumns}
        onSearchChange={handleSearch}
        title={
          !jobsLoaded || !importJobs || importJobs.totalJobs === 0
            ? 'Added repositories'
            : `Added repositories (${importJobs.totalJobs})`
        }
        components={{
          Header: () => (
            <RepositoriesHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              showImportJobs
            />
          ),
          Body: () => (
            <AddedRepositoriesTableBody
              error={errJobs}
              loading={!jobsLoaded}
              rows={sortedData}
              emptyRows={emptyRows}
            />
          ),

          Pagination: () => (
            <TablePagination
              rowsPerPageOptions={[
                { value: 5, label: '5 rows' },
                { value: 10, label: '10 rows' },
                { value: 20, label: '20 rows' },
                { value: 50, label: '50 rows' },
                { value: 100, label: '100 rows' },
              ]}
              component="div"
              count={importJobs.totalJobs || 0}
              rowsPerPage={rowsPerPage}
              page={pageNumber}
              onPageChange={(_event, page: number) => {
                setPageNumber(page);
              }}
              onRowsPerPageChange={event => {
                setRowsPerPage(event.target.value as unknown as number);
              }}
              labelRowsPerPage={null}
            />
          ),
        }}
        emptyContent={
          <div data-testid="no-import-jobs-found" className={classes.empty}>
            No records found
          </div>
        }
      />
      {openDrawer && (
        <EditCatalogInfo
          open={openDrawer}
          onClose={closeDrawer}
          importStatus={drawerData}
        />
      )}
      {openDialog && (
        <DeleteRepositoryDialog
          open={openDialog}
          closeDialog={closeDialog}
          repository={deleteComponent as AddRepositoryData}
        />
      )}
    </>
  );
};
