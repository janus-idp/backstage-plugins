import { useApi } from '@backstage/core-plugin-api';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { lightspeedApiRef } from '../api/api';
import { ConversationList } from '../types';

export const useDeleteConversation = () => {
  const lightspeedApi = useApi(lightspeedApiRef);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: {
      conversation_id: string;
      invalidateCache?: boolean;
    }) => {
      await lightspeedApi.deleteConversation(props.conversation_id);
    },
    onMutate: async props => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });

      const previousConversations: ConversationList | undefined =
        queryClient.getQueryData(['conversations']);

      queryClient.setQueryData(['conversations'], (old: ConversationList) =>
        old.filter(c => c.conversation_id !== props.conversation_id),
      );

      return { previousConversations };
    },
    onSuccess: (_, props) => {
      if (props.invalidateCache) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(
        ['conversations'],
        context?.previousConversations,
      );
      return { success: false };
    },
  });
};
