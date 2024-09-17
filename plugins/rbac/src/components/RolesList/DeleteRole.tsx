import React from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import Delete from '@mui/icons-material/Delete';

import { useDeleteDialog } from '@janus-idp/shared-react';

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
  const { setDeleteComponent, setOpenDialog } = useDeleteDialog();

  const openDialog = (name: string) => {
    setDeleteComponent({ roleName: name });
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
