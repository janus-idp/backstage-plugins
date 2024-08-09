import React from 'react';
import useAsync from 'react-use/esm/useAsync';

import { SidebarItem } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import { getImageForIconClass } from '../utils/icons';

export const icon = () => {
  return (
    <img
      src={getImageForIconClass('icon-bulk-import-white')}
      alt="bulk import icon"
      style={{ height: '25px' }}
    />
  );
};

export const BulkImportIcon = () => {
  const bulkImportApi = useApi(bulkImportApiRef);
  const { loading: isUserLoading, value: result } = useAsync(
    async () => await bulkImportApi.getUserAuthorization(),
    [],
  );

  const config = useApi(configApiRef);
  const isPermissionFrameworkEnabled =
    config.getOptionalBoolean('permission.enabled');

  if (!isUserLoading && isPermissionFrameworkEnabled) {
    return result?.status === 'ok' ? (
      <SidebarItem
        text="Bulk import"
        to="bulk-import/repositories"
        icon={icon}
      />
    ) : null;
  }
  return null;
};
