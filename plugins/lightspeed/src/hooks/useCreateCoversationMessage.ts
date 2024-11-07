import { useApi } from '@backstage/core-plugin-api';

import { useMutation } from '@tanstack/react-query';

import { lightspeedApiRef } from '../api/api';

export const useCreateConversationMessage = () => {
  const lightspeedApi = useApi(lightspeedApiRef);

  return useMutation({
    mutationFn: async ({
      prompt,
      selectedModel,
      currentConversation,
    }: {
      prompt: string;
      selectedModel: string;
      currentConversation: string;
    }) => {
      if (!currentConversation) {
        throw new Error('Failed to generate AI response');
      }

      return await lightspeedApi.createMessage(
        `${prompt}`,
        selectedModel,
        currentConversation,
      );
    },
    onError: error => {
      // eslint-disable-next-line
      console.warn(error);
    },
  });
};
