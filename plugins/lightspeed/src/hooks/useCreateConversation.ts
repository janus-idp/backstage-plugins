import { useApi } from '@backstage/core-plugin-api';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { lightspeedApiRef } from '../api/api';

export const useCreateConversation = () => {
  const lightspeedApi = useApi(lightspeedApiRef);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return lightspeedApi.createConversation();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
