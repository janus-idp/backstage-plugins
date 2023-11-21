import {
  AlertApiForwarder,
  ConfigReader,
  ErrorAlerter,
  ErrorApiForwarder,
  LocalStorageFeatureFlags,
} from '@backstage/core-app-api';
import {
  alertApiRef,
  configApiRef,
  errorApiRef,
  featureFlagsApiRef,
} from '@backstage/core-plugin-api';

const configApi = new ConfigReader({});
const featureFlagsApi = new LocalStorageFeatureFlags();
const alertApi = new AlertApiForwarder();
const errorApi = new ErrorAlerter(alertApi, new ErrorApiForwarder());

export const apis = [
  [configApiRef, configApi],
  [featureFlagsApiRef, featureFlagsApi],
  [alertApiRef, alertApi],
  [errorApiRef, errorApi],
] as const;
