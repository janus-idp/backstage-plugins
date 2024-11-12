import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import { InMemoryStore } from '@langchain/core/stores';

import { Roles } from '../service/types';

export type ConversationHistory = {
  history: BaseMessage[];
  summary?: string;
};
const historyStore = new InMemoryStore<ConversationHistory>();

export async function saveHistory(
  conversation_id: string,
  role: string,
  message: string,
  timestamp?: number,
  model?: string,
): Promise<void> {
  let newMessage: BaseMessage;
  switch (role) {
    case Roles.AIRole: {
      newMessage = new AIMessage({
        content: message,
        response_metadata: {
          created_at: timestamp || Date.now(),
          model: model,
        },
      });
      break;
    }
    case Roles.HumanRole: {
      newMessage = new HumanMessage({
        content: message,
        response_metadata: {
          created_at: timestamp || Date.now(),
        },
      });
      break;
    }
    case Roles.SystemRole: {
      newMessage = new SystemMessage({
        content: message,
        response_metadata: {
          created_at: timestamp || Date.now(),
        },
      });
      break;
    }
    default:
      throw new Error(`Unknown role: ${role}`);
  }

  const sessionHistory = await historyStore.mget([conversation_id]);
  let newHistory: BaseMessage[] = [];
  let summary = '';
  if (sessionHistory && sessionHistory[0]) {
    newHistory = sessionHistory[0].history;
    summary = sessionHistory[0].summary ? sessionHistory[0].summary : '';
  }
  newHistory.push(newMessage);
  const newConversationHistory: ConversationHistory = {
    history: newHistory,
    summary: summary,
  };
  await historyStore.mset([[conversation_id, newConversationHistory]]);
}

export async function saveSummary(
  conversation_id: string,
  summary: string,
): Promise<void> {
  const sessionHistory = await historyStore.mget([conversation_id]);
  if (!sessionHistory[0]) {
    throw new Error(`unknown conversation_id: ${conversation_id}`);
  }
  const newConversationHistory: ConversationHistory = {
    history: sessionHistory[0].history,
    summary: summary,
  };
  await historyStore.mset([[conversation_id, newConversationHistory]]);
}

// export async function loadHistory(
//   conversation_id: string,
//   historyLength: number,
// ): Promise<BaseMessage[]> {
//   const sessionHistory = await historyStore.mget([conversation_id]);
//   if (!sessionHistory[0]) {
//     throw new Error(`unknown conversation_id: ${conversation_id}`);
//   }
//   return sessionHistory[0]?.history?.slice(-historyLength);
// }

export async function deleteHistory(conversation_id: string): Promise<void> {
  return await historyStore.mdelete([conversation_id]);
}

export async function loadAllConversations(user_id: string): Promise<string[]> {
  const conversationIDList = [];
  for await (const key of historyStore.yieldKeys(user_id)) {
    conversationIDList.push(key);
  }
  return conversationIDList;
}

export async function loadHistory(
  conversation_id: string,
  historyLength: number,
): Promise<ConversationHistory> {
  const sessionHistory = await historyStore.mget([conversation_id]);
  if (!sessionHistory[0]) {
    throw new Error(`unknown conversation_id: ${conversation_id}`);
  }
  const responseConversationHistory: ConversationHistory = {
    history: sessionHistory[0].history?.slice(-historyLength),
    summary: sessionHistory[0].summary,
  };
  return responseConversationHistory;
}
