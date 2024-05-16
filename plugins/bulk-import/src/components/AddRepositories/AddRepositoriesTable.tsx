import * as React from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { FormikErrors } from 'formik';

import { AddRepositoriesFormValues } from '../../types';
import { AddRepositoriesTableToolbar } from './AddRepositoriesTableToolbar';
import { RepositoriesTable } from './RepositoriesTable';

export const AddRepositoriesTable = ({
  title,
  selectedRepositoriesFormData,
  setFieldValue,
}: {
  title: string;
  selectedRepositoriesFormData: AddRepositoriesFormValues;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<AddRepositoriesFormValues>> | Promise<void>;
}) => {
  const [searchString, setSearchString] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 7 }}>
        <AddRepositoriesTableToolbar
          title={title}
          setSearchString={setSearchString}
          selectedRepositoriesFormData={selectedRepositoriesFormData}
          setFieldValue={setFieldValue}
          onPageChange={setPage}
        />
        {selectedRepositoriesFormData.repositoryType === 'repository' ? (
          <RepositoriesTable
            searchString={searchString}
            selectedRepositoriesFormData={selectedRepositoriesFormData}
            setFieldValue={setFieldValue}
            page={page}
            setPage={setPage}
          />
        ) : (
          <RepositoriesTable
            searchString={searchString}
            selectedRepositoriesFormData={selectedRepositoriesFormData}
            setFieldValue={setFieldValue}
            page={page}
            setPage={setPage}
            showOrganizations
          />
        )}
      </Paper>
    </Box>
  );
};
