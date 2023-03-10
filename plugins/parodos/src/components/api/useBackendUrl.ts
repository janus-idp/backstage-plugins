import { configApiRef, useApi } from '@backstage/core-plugin-api';

export const useBackendUrl = (): string => {
  const configApi = useApi(configApiRef);
  const backendUrl = configApi.getString('backend.baseUrl');
  return backendUrl;
};
