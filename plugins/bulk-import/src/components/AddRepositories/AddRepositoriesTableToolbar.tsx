import * as React from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  RepositorySelection,
} from '../../types';
import { RepositoriesSearchBar } from './AddRepositoriesSearchBar';

export const AddRepositoriesTableToolbar = ({
  title,
  setSearchString,
  onPageChange,
  activeOrganization,
  selectedReposFromDrawer,
}: {
  title: string;
  setSearchString: (str: string) => void;
  onPageChange?: (page: number) => void;
  activeOrganization?: AddRepositoriesData;
  selectedReposFromDrawer?: number[];
}) => {
  const { setFieldValue, values } =
    useFormikContext<AddRepositoriesFormValues>();
  const [selection, setSelection] = React.useState<string>(
    RepositorySelection.Repository,
  );
  const [search, setSearch] = React.useState<string>('');
  const [selectedReposNumber, setSelectedReposNumber] = React.useState(0);
  const handleToggle = (
    _event: React.MouseEvent<HTMLElement>,
    type: string,
  ) => {
    if (type && onPageChange) {
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
        values.repositories ? Object.keys(values.repositories).length : 0,
      );
    }
  }, [selectedReposFromDrawer, values, activeOrganization]);

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1, lg: 3, md: 3 },
        pt: '14px',
        pb: '14px',
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
          <ToggleButton
            value={RepositorySelection.Repository}
            data-testid="repository-view"
          >
            Repository
          </ToggleButton>
          <ToggleButton
            value={RepositorySelection.Organization}
            data-testid="organization-view"
          >
            Organization
          </ToggleButton>
        </ToggleButtonGroup>
      )}
      <RepositoriesSearchBar value={search} onChange={handleSearch} />
    </Toolbar>
  );
};
