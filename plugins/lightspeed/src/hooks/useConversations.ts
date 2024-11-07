import { useApi } from '@backstage/core-plugin-api';

import { useQuery } from '@tanstack/react-query';

import { lightspeedApiRef } from '../api/api';

// Fetch all conversations
export const useConversations = () => {
  const lightspeedApi = useApi(lightspeedApiRef);
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await lightspeedApi.getConversations();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
