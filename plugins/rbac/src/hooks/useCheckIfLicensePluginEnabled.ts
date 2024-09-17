import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { licensedUsersApiRef } from '../api/LicensedUsersClient';

export const useCheckIfLicensePluginEnabled = (): {
  loading: boolean;
  isEnabled: boolean | undefined;
  licenseCheckError: Error;
} => {
  const licensedUsersClient = useApi(licensedUsersApiRef);
  const {
    value: isEnabled,
    loading,
    error: licenseCheckError,
  } = useAsync(async () => await licensedUsersClient.isLicensePluginEnabled());

  return {
    loading,
    isEnabled,
    licenseCheckError: licenseCheckError as Error,
  };
};
