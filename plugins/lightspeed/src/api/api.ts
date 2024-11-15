import { createApiRef } from '@backstage/core-plugin-api';

import OpenAI from 'openai';

import { BaseMessage, ConversationList } from '../types';

export type LightspeedAPI = {
  getAllModels: () => Promise<OpenAI.Models.Model[]>;
  getConversationMessages: (conversation_id: string) => Promise<BaseMessage[]>;
  createConversation: () => Promise<{ conversation_id: string }>;
  createMessage: (
    prompt: string,
    selectedModel: string,
    conversation_id: string,
  ) => Promise<ReadableStreamDefaultReader>;
  deleteConversation: (
    conversation_id: string,
  ) => Promise<{ success: boolean }>;
  getConversations: () => Promise<ConversationList>;
};

export const lightspeedApiRef = createApiRef<LightspeedAPI>({
  id: 'plugin.lightspeed.service',
});
