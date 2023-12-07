import React from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import Delete from '@mui/icons-material/Delete';

import { useDeleteDialog } from './DeleteDialogContext';

type DeleteRoleProps = {
  roleName: string;
  disable: boolean;
  tooltip?: string;
  dataTestId: string;
};

const DeleteRole = ({
  roleName,
  tooltip,
  disable,
  dataTestId,
}: DeleteRoleProps) => {
  const { setDeleteRoleName, setOpenDialog } = useDeleteDialog();

  const openDialog = (name: string) => {
    setDeleteRoleName(name);
    setOpenDialog(true);
  };

  return (
    <Tooltip title={tooltip || ''}>
      <span data-testid={dataTestId}>
        <IconButton
          color="inherit"
          onClick={() => openDialog(roleName)}
          aria-label="Delete"
          disabled={disable}
          title={tooltip || 'Delete Role'}
        >
          <Delete />
        </IconButton>
      </span>
    </Tooltip>
  );
};
export default DeleteRole;
