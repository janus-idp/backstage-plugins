import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import { IconButton, Tooltip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useFormikContext } from 'formik';

import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';
import { useDrawer } from '@janus-idp/shared-react';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  ImportJobStatus,
  RepositoryStatus,
} from '../../types';

const CatalogInfoAction = ({ data }: { data: AddRepositoryData }) => {
  const { setDrawerData, setOpenDrawer, drawerData } = useDrawer();
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
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
    [setOpenDrawer],
  );

  const openDrawer = (status: ImportJobStatus) => {
    searchParams.set('repository', data.repoUrl || '');
    navigate({
      pathname: location.pathname,
      search: `?${searchParams.toString()}`,
    });
    setOpenDrawer(true);
    setDrawerData(status);
  };

  const hasPermissionToEdit =
    allowed &&
    values.repositories[data.id]?.catalogInfoYaml?.status ===
      RepositoryStatus.WAIT_PR_APPROVAL;

  React.useEffect(() => {
    const shouldOpenPanel = searchParams.get('repository');
    if (shouldOpenPanel) {
      setOpenDrawer(true);
      if (Object.keys(drawerData || {}).length === 0) {
        setDrawerData(value as ImportJobStatus);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
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
            onClick={() => openDrawer(value as ImportJobStatus)}
          >
            <EditIcon />
          </IconButton>
        ) : (
          <IconButton
            target="_blank"
            href={
              values?.repositories[data.id]?.catalogInfoYaml?.pullRequestUrl ||
              values?.repositories[data.id]?.repoUrl ||
              ''
            }
            color="inherit"
            aria-label="View"
          >
            <OpenInNewIcon />
          </IconButton>
        )}
      </span>
    </Tooltip>
  );
};

export default CatalogInfoAction;
