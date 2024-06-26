import React from 'react';

import FormControl from '@mui/material/FormControl';

import { RepositoriesList } from './RepositoriesList';

export const RepositoriesListForm = () => {
  return (
    <FormControl fullWidth>
      <RepositoriesList />
    </FormControl>
  );
};
