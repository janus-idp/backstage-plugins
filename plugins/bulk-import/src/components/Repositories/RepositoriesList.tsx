import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ErrorPage, Table } from '@backstage/core-components';

import Box from '@mui/material/Box';

import { useDeleteDialog, useDrawer } from '@janus-idp/shared-react';

import { useAddedRepositories } from '../../hooks/useAddedRepositories';
import { AddRepositoryData } from '../../types';
import DeleteRepositoryDialog from './DeleteRepositoryDialog';
import EditCatalogInfo from './EditCatalogInfo';
import { columns } from './RepositoriesListColumns';
import { RepositoriesListToolbar } from './RepositoriesListToolbar';

export const RepositoriesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { openDialog, setOpenDialog, deleteComponent } = useDeleteDialog();
  const { openDrawer, setOpenDrawer, drawerData } = useDrawer();
  const [pageNumber, setPageNumber] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchString, setSearchString] = React.useState('');

  const {
    data: importJobs,
    error: errJobs,
    loaded: jobsLoaded,
    retry,
  } = useAddedRepositories(pageNumber + 1, rowsPerPage, searchString);

  const closeDialog = () => {
    setOpenDialog(false);
    retry();
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

  if (Object.keys(errJobs || {}).length > 0) {
    return <ErrorPage status={errJobs.name} statusMessage={errJobs.message} />;
  }

  return (
    <>
      <RepositoriesListToolbar />
      <Table
        onSearchChange={(search: string) => {
          setSearchString(search);
        }}
        onPageChange={(page: number, pageSize: number) => {
          setPageNumber(page);
          setRowsPerPage(pageSize);
        }}
        onRowsPerPageChange={(pageSize: number) => {
          setRowsPerPage(pageSize);
        }}
        title={
          !jobsLoaded || !importJobs
            ? 'Added repositories'
            : `Added repositories (${importJobs.length})`
        }
        options={{ padding: 'default', search: true, paging: true }}
        data={importJobs ?? []}
        isLoading={!jobsLoaded}
        columns={columns}
        emptyContent={
          <Box
            data-testid="added-repositories-table-empty"
            sx={{
              padding: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            No records found
          </Box>
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
