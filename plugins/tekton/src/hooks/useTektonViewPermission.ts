import { usePermission } from '@backstage/plugin-permission-react';

import { tektonViewPermission } from '@janus-idp/backstage-plugin-tekton-common';

export const useTektonViewPermission = () => {
  const tektonViewPermissionResult = usePermission({
    permission: tektonViewPermission,
  });

  return tektonViewPermissionResult.allowed;
};
