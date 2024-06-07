import React from 'react';
import { useAsync } from 'react-use';

import { SidebarItem } from '@backstage/core-components';
import {
  configApiRef,
  IconComponent,
  useApi,
} from '@backstage/core-plugin-api';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

import { rbacApiRef } from '../api/RBACBackendClient';

export const Administration = () => {
  const rbacApi = useApi(rbacApiRef);
  const { loading: isUserLoading, value: result } = useAsync(
    async () => await rbacApi.getUserAuthorization(),
    [],
  );

  const config = useApi(configApiRef);
  const isRBACPluginEnabled = config.getOptionalBoolean('permission.enabled');

  if (!isUserLoading && isRBACPluginEnabled) {
    return result?.status === 'Authorized' ? (
      <SidebarItem
        text="Administration"
        to="rbac"
        icon={AdminPanelSettingsOutlinedIcon as IconComponent}
      />
    ) : null;
  }
  return null;
};
