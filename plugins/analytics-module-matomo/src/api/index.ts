import {
  analyticsApiRef,
  configApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';

import { MatomoAnalytics } from './Matomo';

export { MatomoAnalytics } from './Matomo';

export const MatomoAnalyticsApi = createApiFactory({
  api: analyticsApiRef,
  deps: { configApi: configApiRef },
  factory: ({ configApi }) => MatomoAnalytics.fromConfig(configApi),
});
