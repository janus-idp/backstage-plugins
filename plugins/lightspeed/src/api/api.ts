import { createApiRef } from '@backstage/core-plugin-api';

import OpenAI from 'openai';

import { BaseMessage } from '../types';

export type LightspeedAPI = {
  createChatCompletions: (
    prompt: string,
    selectedModel: string,
    conversation_id: string,
  ) => Promise<ReadableStreamDefaultReader>;
  getAllModels: () => Promise<OpenAI.Models.Model[]>;
  getConversations: (conversation_id: string) => Promise<BaseMessage[]>;
};

export const lightspeedApiRef = createApiRef<LightspeedAPI>({
  id: 'plugin.lightspeed.service',
});
