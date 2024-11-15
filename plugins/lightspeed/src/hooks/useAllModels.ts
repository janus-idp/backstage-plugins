import { useApi } from '@backstage/core-plugin-api';

import { useQuery } from '@tanstack/react-query';

import { lightspeedApiRef } from '../api/api';

// Fetch all models
export const useAllModels = () => {
  const lightspeedApi = useApi(lightspeedApiRef);
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await lightspeedApi.getAllModels();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
