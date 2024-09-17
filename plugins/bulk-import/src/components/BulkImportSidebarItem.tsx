import React from 'react';

import { SidebarItem } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import { bulkImportPermission } from '@janus-idp/backstage-plugin-bulk-import-common';

import { getImageForIconClass } from '../utils/icons';

export const BulkImportIcon = () => {
  return (
    <img
      src={getImageForIconClass('icon-bulk-import-white')}
      alt="bulk import icon"
      style={{ height: '25px' }}
    />
  );
};

export const BulkImportSidebarItem = () => {
  const { loading: isUserLoading, allowed } = usePermission({
    permission: bulkImportPermission,
    resourceRef: bulkImportPermission.resourceType,
  });

  const config = useApi(configApiRef);
  const isPermissionFrameworkEnabled =
    config.getOptionalBoolean('permission.enabled');

  if (!isUserLoading && isPermissionFrameworkEnabled) {
    return allowed ? (
      <SidebarItem
        text="Bulk import"
        to="bulk-import/repositories"
        icon={BulkImportIcon}
      />
    ) : null;
  }

  if (!isPermissionFrameworkEnabled) {
    return (
      <SidebarItem
        text="Bulk import"
        to="bulk-import/repositories"
        icon={BulkImportIcon}
      />
    );
  }
  return null;
};

export default BulkImportIcon;
