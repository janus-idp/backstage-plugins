import { usePermission } from '@backstage/plugin-permission-react';

import { quayViewPermission } from '@janus-idp/backstage-plugin-quay-common';

export const useQuayViewPermission = () => {
  const quayViewPermissionResult = usePermission({
    permission: quayViewPermission,
  });

  return quayViewPermissionResult.allowed;
};
