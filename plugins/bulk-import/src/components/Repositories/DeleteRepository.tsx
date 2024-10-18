import * as React from 'react';

import Delete from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useDeleteDialog } from '@janus-idp/shared-react';

import { AddRepositoryData } from '../../types';

const DeleteRepository = ({ data }: { data: AddRepositoryData }) => {
  const { setDeleteComponent, setOpenDialog } = useDeleteDialog();

  const openDialog = (dialogData: AddRepositoryData) => {
    setDeleteComponent(dialogData);
    setOpenDialog(true);
  };

  return (
    <Tooltip title="Remove">
      <span data-testid="delete-repository">
        <IconButton
          color="inherit"
          onClick={() => openDialog(data)}
          aria-label="Delete"
          size="large"
        >
          <Delete />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default DeleteRepository;
