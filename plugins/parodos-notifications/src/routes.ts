import { createRouteRef } from '@backstage/core-plugin-api';

import { PARODOS_NOTIFICATIONS_ROUTE } from './constants';

export const rootRouteRef = createRouteRef({
  id: PARODOS_NOTIFICATIONS_ROUTE,
});
