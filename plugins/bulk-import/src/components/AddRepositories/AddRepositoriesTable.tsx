import * as React from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useFormikContext } from 'formik';

import { AddRepositoriesFormValues, RepositorySelection } from '../../types';
import { AddRepositoriesTableToolbar } from './AddRepositoriesTableToolbar';
import { RepositoriesTable } from './RepositoriesTable';

export const AddRepositoriesTable = ({ title }: { title: string }) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const [searchString, setSearchString] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 7 }}>
        <AddRepositoriesTableToolbar
          title={title}
          setSearchString={setSearchString}
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
