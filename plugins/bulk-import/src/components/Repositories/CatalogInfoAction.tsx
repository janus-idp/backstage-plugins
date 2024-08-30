import React, { useState } from 'react';
import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import { IconButton, Tooltip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoryData,
  ImportJobStatus,
  RepositoryStatus,
} from '../../types';
import EditCatalogInfo from './EditCatalogInfo';

const CatalogInfoAction = ({ data }: { data: AddRepositoryData }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bulkImportApi = useApi(bulkImportApiRef);

  const { allowed } = usePermission({
    permission: bulkImportPermission,
    resourceRef: bulkImportPermission.resourceType,
  });
  const { value } = useAsync(
    async () =>
      await bulkImportApi.getImportAction(
        data?.repoUrl || '',
        data?.defaultBranch || 'main',
      ),
  );

  const importStatus: ImportJobStatus = { ...(value as ImportJobStatus) };

  const handleClick = () => {
    setDrawerOpen(true);
  };

  const hasPermissionToEdit =
    allowed &&
    data?.catalogInfoYaml?.status === RepositoryStatus.WAIT_PR_APPROVAL;

  return (
    <>
      <Tooltip
        title={
          hasPermissionToEdit
            ? 'Edit catalog-info.yaml pull request'
            : 'View catalog-info.yaml file'
        }
      >
        <span
          data-testid={
            hasPermissionToEdit ? 'edit-catalog-info' : 'view-catalog-info'
          }
        >
          {hasPermissionToEdit ? (
            <IconButton
              color="inherit"
              aria-label="Update"
              data-testid="update"
              onClick={() => handleClick()}
            >
              <EditIcon />
            </IconButton>
          ) : (
            <IconButton
              target="_blank"
              href={
                data?.catalogInfoYaml?.status === RepositoryStatus.ADDED
                  ? data?.repoUrl || ''
                  : data?.catalogInfoYaml?.pullRequest || ''
              }
              color="inherit"
              aria-label={
                data?.catalogInfoYaml?.status === RepositoryStatus.ADDED
                  ? 'View'
                  : 'View PR'
              }
            >
              <OpenInNewIcon />
            </IconButton>
          )}
        </span>
      </Tooltip>
      {hasPermissionToEdit && drawerOpen && (
        <EditCatalogInfo
          open={drawerOpen}
          importStatus={importStatus}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
};

export default CatalogInfoAction;
