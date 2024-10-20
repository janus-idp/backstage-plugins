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
  const { setStatus } = useFormikContext<AddRepositoriesFormValues>();
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bulkImportApi = useApi(bulkImportApiRef);

  const repoUrl = searchParams.get('repository');
  const defaultBranch = searchParams.get('defaultBranch');

  const { allowed } = usePermission({
    permission: bulkImportPermission,
    resourceRef: bulkImportPermission.resourceType,
  });
  const { value, loading } = useAsync(async () => {
    if (repoUrl) {
      return await bulkImportApi.getImportAction(
        repoUrl,
        defaultBranch || 'main',
      );
    }
    return null;
  }, [repoUrl, defaultBranch]);

  const handleOpenDrawer = (importStatus: ImportJobStatus) => {
    searchParams.set('repository', data.repoUrl || '');
    searchParams.set('defaultBranch', data.defaultBranch || 'main');
    navigate({
      pathname: location.pathname,
      search: `?${searchParams.toString()}`,
    });
    setOpenDrawer(true);
    setDrawerData(importStatus);
  };

  const hasPermissionToEdit =
    allowed &&
    values.repositories[data.id]?.catalogInfoYaml?.status ===
      RepositoryStatus.WAIT_PR_APPROVAL;

  const removeQueryParams = () => {
    searchParams.delete('repository');
    searchParams.delete('defaultBranch');
    navigate({
      pathname: location.pathname,
      search: `?${searchParams.toString()}`,
    });
  };

  React.useEffect(() => {
    if (!loading && repoUrl && defaultBranch) {
      const shouldOpenPanel =
        value?.status === RepositoryStatus.WAIT_PR_APPROVAL &&
        values.repositories[(value as ImportJobStatus)?.repository?.id];

      if ((value as Response)?.statusText) {
        setOpenDrawer(false);
        setStatus({
          title: (value as Response)?.statusText,
          url: (value as Response)?.url,
        });
        removeQueryParams();
      } else if (shouldOpenPanel) {
        setOpenDrawer(true);
        if (Object.keys(drawerData || {}).length === 0) {
          setDrawerData(value as ImportJobStatus);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoUrl, defaultBranch, value?.status, values?.repositories, loading]);

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
            onClick={() => handleOpenDrawer(value as ImportJobStatus)}
          >
            <EditIcon />
          </IconButton>
        ) : (
          <IconButton
            target="_blank"
            href={
              values?.repositories?.[data.id]?.catalogInfoYaml?.prTemplate
                ?.pullRequestUrl ||
              values?.repositories?.[data.id]?.repoUrl ||
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
