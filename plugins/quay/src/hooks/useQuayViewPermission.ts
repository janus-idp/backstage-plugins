import { catalogEntityReadPermission } from '@backstage/plugin-catalog-common/alpha';
import { usePermission } from '@backstage/plugin-permission-react';

import { quayViewPermission } from '@janus-idp/backstage-plugin-quay-common';

export const useQuayViewPermission = () => {
  const quayViewPermissionResult = usePermission({
    permission: quayViewPermission,
  });

  const catalogEntityPermissionResult = usePermission({
    permission: catalogEntityReadPermission,
    resourceRef: catalogEntityReadPermission.resourceType,
  });

  return (
    quayViewPermissionResult.allowed && catalogEntityPermissionResult.allowed
  );
};
