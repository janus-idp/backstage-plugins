export type Conversations = {
  [key: string]: {
    user: string;
    bot: string;
    model: string;
    loading: boolean;
    timestamp: string;
    botTimestamp: string;
  };
};

export interface BaseMessage {
  lc: number;
  type: string;
  id: string[];
  kwargs: {
    content: string;
    response_metadata: {
      created_at: number;
      role: string;
    };
    additional_kwargs: {
      [_key: string]: any;
    };
  };
}
export type ConversationSummary = {
  conversation_id: string;
  lastMessageTimestamp: number;
  summary: string;
};

export type ConversationList = ConversationSummary[];
