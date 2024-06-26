import React, { useState } from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import Delete from '@mui/icons-material/Delete';
import { useFormikContext } from 'formik';

import { AddRepositoriesData, AddRepositoriesFormValues } from '../../types';
import DeleteRepositoryDialog from './DeleteRepositoryDialog';

type DeleteRepositoryProps = {
  data: AddRepositoriesData;
};

const DeleteRepository = ({ data }: DeleteRepositoryProps) => {
  const [open, setOpen] = useState(false);
  const { values, setFieldValue } =
    useFormikContext<AddRepositoriesFormValues>();
  const handleClickRemove = () => {
    const newRepositories = values.repositories;
    if (data.repoName) {
      delete newRepositories[data.repoName];
      setFieldValue('repositories', newRepositories);
    }
  };

  return (
    <>
      <Tooltip title="Remove">
        <span data-testid="delete-repository">
          <IconButton
            color="inherit"
            onClick={() => setOpen(true)}
            aria-label="Delete"
          >
            <Delete />
          </IconButton>
        </span>
      </Tooltip>
      {open && (
        <DeleteRepositoryDialog
          open={open}
          repository={data}
          closeDialog={() => setOpen(false)}
          removeRepository={handleClickRemove}
        />
      )}
    </>
  );
};

export default DeleteRepository;
