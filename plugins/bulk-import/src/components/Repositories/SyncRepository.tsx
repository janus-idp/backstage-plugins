import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { IconButton, Tooltip } from '@material-ui/core';
import SyncIcon from '@mui/icons-material/Sync';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  AddRepositoryData,
} from '../../types/types';

type SyncRepositoryProps = {
  data: AddRepositoryData;
};

const SyncRepository = ({ data }: SyncRepositoryProps) => {
  const bulkImportApi = useApi(bulkImportApiRef);
  const { setFieldValue } = useFormikContext<AddRepositoriesFormValues>();

  const handleClick = async () => {
    const value = await bulkImportApi.checkImportStatus(
      data.repoUrl || '',
      data?.defaultBranch || 'main',
    );
    setFieldValue(
      `repositories.[${data.repoName}].catalogInfoYaml.status`,
      value.status,
    );
    setFieldValue(
      `repositories.[${data.repoName}].catalogInfoYaml.lastUpdated`,
      value.lastUpdate,
    );
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
