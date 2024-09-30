import * as React from 'react';

import { Box, Paper } from '@material-ui/core';
import { useFormikContext } from 'formik';

import { AddRepositoriesFormValues, RepositorySelection } from '../../types';
import { AddRepositoriesTableToolbar } from './AddRepositoriesTableToolbar';
import { RepositoriesTable } from './RepositoriesTable';

export const AddRepositoriesTable = ({ title }: { title: string }) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const [searchString, setSearchString] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(0);
  const handleSearch = (str: string) => {
    setSearchString(str);
    setPage(0);
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Paper style={{ width: '100%' }}>
        <AddRepositoriesTableToolbar
          title={title}
          setSearchString={handleSearch}
          onPageChange={setPage}
        />
        {values.repositoryType === RepositorySelection.Repository ? (
          <RepositoriesTable
            searchString={searchString}
            page={page}
            setPage={setPage}
          />
        ) : (
          <RepositoriesTable
            searchString={searchString}
            page={page}
            setPage={setPage}
            showOrganizations
          />
        )}
      </Paper>
    </Box>
  );
};
