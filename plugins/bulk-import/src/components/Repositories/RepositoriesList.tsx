import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ErrorPage } from '@backstage/core-components';

import {
  Box,
  Paper,
  Table,
  TableContainer,
  TablePagination,
} from '@material-ui/core';

import { useDeleteDialog, useDrawer } from '@janus-idp/shared-react';

import { useAddedRepositories } from '../../hooks/useAddedRepositories';
import { AddRepositoryData, Order } from '../../types';
import { getComparator } from '../../utils/repository-utils';
import { RepositoriesHeader } from '../AddRepositories/RepositoriesHeader';
import { AddedRepositoriesTableBody } from './AddedRepositoriesTableBody';
import DeleteRepositoryDialog from './DeleteRepositoryDialog';
import EditCatalogInfo from './EditCatalogInfo';
import { RepositoriesListToolbar } from './RepositoriesListToolbar';

export const RepositoriesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
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
    searchParams.delete('repository');
    searchParams.delete('defaultBranch');
    navigate({
      pathname: location.pathname,
      search: `?${searchParams.toString()}`,
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

  if (Object.keys(errJobs || {}).length > 0) {
    return <ErrorPage status={errJobs.name} statusMessage={errJobs.message} />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper style={{ width: '100%' }}>
        <RepositoriesListToolbar
          setSearchString={handleSearch}
          jobs={importJobs.totalJobs}
        />
        <TableContainer style={{ padding: '0 24px', height: '100%' }}>
          <Table
            style={{ minWidth: 750, height: '70%' }}
            size="small"
            data-testid="added-repositories"
          >
            <RepositoriesHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              showImportJobs
            />
            <AddedRepositoriesTableBody
              loading={!jobsLoaded}
              rows={sortedData}
              emptyRows={emptyRows}
            />
          </Table>
        </TableContainer>
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
            setRowsPerPage(parseInt(event.target.value, 10));
          }}
          labelRowsPerPage={null}
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
      </Paper>
    </Box>
  );
};

/*

<Table
        onSearchChange={(search: string) => {
          setSearchString(search);
        }}
        title={
          !jobsLoaded || !importJobs
            ? 'Added repositories'
            : `Added repositories (${importJobs.totalJobs})`
        }
        options={{ padding: 'default', search: true, paging: true }}
        data={importJobs.addedRepositories ?? []}
        isLoading={!jobsLoaded}
        columns={RepositoriesListColumns}
        components={{
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
          <div
            data-testid="added-repositories-table-empty"
            className={classes.empty}
          >
            No records found
          </div>
        }
      />
*/
