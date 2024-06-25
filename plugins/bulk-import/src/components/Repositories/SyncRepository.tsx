import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { IconButton, Tooltip } from '@material-ui/core';
import SyncIcon from '@mui/icons-material/Sync';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  ImportJobStatus,
} from '../../types';

type SyncRepositoryProps = {
  data: AddRepositoryData;
};

const SyncRepository = ({ data }: SyncRepositoryProps) => {
  const bulkImportApi = useApi(bulkImportApiRef);
  const { setFieldValue } = useFormikContext<AddRepositoriesFormValues>();

  const handleClick = async () => {
    const value = await bulkImportApi.getImportAction(
      data.repoUrl || '',
      data?.defaultBranch || 'main',
    );
    setFieldValue(
      `repositories.[${data.repoName}].catalogInfoYaml.status`,
      (value as ImportJobStatus).status,
    );
    setFieldValue(
      `repositories.[${data.repoName}].catalogInfoYaml.lastUpdated`,
      (value as ImportJobStatus).lastUpdate,
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
