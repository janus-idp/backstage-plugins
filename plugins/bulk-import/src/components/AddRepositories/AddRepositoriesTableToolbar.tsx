import * as React from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { FormikErrors } from 'formik';

import { AddRepositoriesData, AddRepositoriesFormValues } from '../../types';
import { RepositoriesSearchBar } from './AddRepositoriesSearchBar';

export const AddRepositoriesTableToolbar = ({
  title,
  setSearchString,
  selectedRepositoriesFormData,
  setFieldValue,
  onPageChange,
  activeOrganization,
  selectedReposFromDrawer,
}: {
  title: string;
  setSearchString: (str: string) => void;
  selectedRepositoriesFormData: AddRepositoriesFormValues;
  setFieldValue?: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<AddRepositoriesFormValues>> | Promise<void>;
  onPageChange?: (page: number) => void;
  activeOrganization?: AddRepositoriesData;
  selectedReposFromDrawer?: number[];
}) => {
  const [selection, setSelection] = React.useState('repository');
  const [search, setSearch] = React.useState<string>('');
  const [selectedReposNumber, setSelectedReposNumber] = React.useState(0);
  const handleToggle = (
    _event: React.MouseEvent<HTMLElement>,
    type: string,
  ) => {
    if (type && setFieldValue && onPageChange) {
      setSelection(type);
      setFieldValue('repositoryType', type);
      onPageChange(0);
    }
  };

  const handleSearch = (filter: string) => {
    setSearchString(filter);
    setSearch(filter);
  };

  React.useEffect(() => {
    if (activeOrganization && selectedReposFromDrawer) {
      const thisSelectedReposCount = activeOrganization.repositories?.filter(
        repo => selectedReposFromDrawer.includes(repo.id) && repo.id > -1,
      ).length;
      setSelectedReposNumber(thisSelectedReposCount || 0);
    } else {
      setSelectedReposNumber(
        selectedRepositoriesFormData.repositories?.length || 0,
      );
    }
  }, [
    selectedReposFromDrawer,
    selectedRepositoriesFormData,
    activeOrganization,
  ]);

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1, lg: 3, md: 3 },
        pt: '14px',
      }}
    >
      <Typography sx={{ flex: '1 1 100%' }} variant="h5" id={title}>
        {`${title} (${selectedReposNumber})`}
      </Typography>
      {!activeOrganization && (
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
      )}
      <RepositoriesSearchBar value={search} onChange={handleSearch} />
    </Toolbar>
  );
};
