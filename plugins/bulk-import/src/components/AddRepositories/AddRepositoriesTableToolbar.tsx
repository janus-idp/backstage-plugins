import * as React from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { FormikErrors } from 'formik';

import { AddRepositoriesFormValues } from '../../types';
import { getRepositoriesSelected } from '../../utils/repository-utils';
import { RepositoriesSearchBar } from './AddRepositoriesSearchBar';

export const AddRepositoriesTableToolbar = ({
  title,
  setSearchString,
  selectedRepositoriesFormData,
  setFieldValue,
  onPageChange,
}: {
  title: string;
  setSearchString: (str: string) => void;
  selectedRepositoriesFormData: AddRepositoriesFormValues;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<AddRepositoriesFormValues>> | Promise<void>;
  onPageChange: (page: number) => void;
}) => {
  const [selection, setSelection] = React.useState('repository');
  const [search, setSearch] = React.useState<string>('');
  const handleToggle = (
    _event: React.MouseEvent<HTMLElement>,
    type: string,
  ) => {
    if (type) {
      setSelection(type);
      setFieldValue('repositoryType', type);
      onPageChange(0);
    }
  };

  const handleSearch = (filter: string) => {
    setSearchString(filter);
    setSearch(filter);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1, lg: 3, md: 3 },
        pt: '14px',
      }}
    >
      <Typography sx={{ flex: '1 1 100%' }} variant="h5" id={title}>
        {`${title} (${getRepositoriesSelected(selectedRepositoriesFormData)})`}
      </Typography>
      <ToggleButtonGroup
        size="medium"
        color="primary"
        value={selection}
        exclusive
        onChange={handleToggle}
        aria-label="repository-type"
      >
        <ToggleButton value="repository">Repositories</ToggleButton>
        <ToggleButton value="organization">Organization</ToggleButton>
      </ToggleButtonGroup>
      <RepositoriesSearchBar value={search} onChange={handleSearch} />
    </Toolbar>
  );
};
