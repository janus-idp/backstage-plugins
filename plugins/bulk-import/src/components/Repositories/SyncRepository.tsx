import React from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import SyncIcon from '@mui/icons-material/Sync';

import { AddRepositoriesData } from '../../types';

type SyncRepositoryProps = {
  data: AddRepositoriesData;
};

const SyncRepository = ({ data }: SyncRepositoryProps) => {
  const handleClick = () => {
    // TODO: Add refresh logic
    return data;
  };

  return (
    <Tooltip title="Refresh">
      <span data-testid="refresh-repository">
        <IconButton
          color="inherit"
          onClick={() => handleClick()}
          aria-label="Refresh"
        >
          <SyncIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default SyncRepository;
