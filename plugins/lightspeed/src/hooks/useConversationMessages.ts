import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { MessageProps } from '@patternfly/virtual-assistant';
import { useQuery } from '@tanstack/react-query';

import { lightspeedApiRef } from '../api/api';
import logo from '../images/logo.svg';
import {
  createBotMessage,
  createUserMessage,
  getMessageData,
  getTimestamp,
  splitJsonStrings,
} from '../utils/lightspeed-chatbox-utils';
import { useCreateConversationMessage } from './useCreateCoversationMessage';

// Fetch all conversation messages
export const useFetchConversationMessages = (currentConversation: string) => {
  const lightspeedApi = useApi(lightspeedApiRef);
  return useQuery({
    queryKey: ['conversationMessages', currentConversation],
    queryFn: currentConversation
      ? async () => {
          const response =
            await lightspeedApi.getConversationMessages(currentConversation);

          return response;
        }
      : undefined,
    retry: false,
  });
};

type Conversations = { [_key: string]: MessageProps[] };

/**
 * Fetches all the messages for given conversation_id
 * @param conversationId
 * @param userName
 * @param selectedModel
 * @param avatar
 *
 */
export const useConversationMessages = (
  conversationId: string,
  userName: string | undefined,
  selectedModel: string,
  avatar: string | undefined,
  onComplete?: (message: string) => void,
) => {
  const { mutateAsync: createMessage } = useCreateConversationMessage();
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  const [currentConversation, setCurrentConversation] =
    React.useState(conversationId);
  const [conversations, setConversations] = React.useState<Conversations>({
    [currentConversation]: [],
  });

  React.useEffect(() => {
    if (currentConversation !== conversationId) {
      setCurrentConversation(conversationId);
      setConversations({
        [conversationId]: [],
      });
    }
  }, [currentConversation, conversationId]);

  const { data: conversationsData = [], ...queryProps } =
    useFetchConversationMessages(currentConversation);

  React.useEffect(() => {
    if (!Array.isArray(conversationsData) || conversationsData.length === 0)
      return;

    const newConvoIndex: number[] = [];

    if (conversations) {
      const _conversations: { [key: string]: any[] } = {
        [currentConversation]: [],
      };

      let index = 0;
      for (let i = 0; i < conversationsData.length; i += 2) {
        const userMessage = conversationsData[i];
        const aiMessage = conversationsData[i + 1];

        const { content: humanMessage, timestamp: userTimestamp } =
          getMessageData(userMessage);
        const {
          model,
          content: botMessage,
          timestamp: botTimestamp,
        } = getMessageData(aiMessage);

        _conversations[currentConversation].push(
          ...[
            createUserMessage({
              avatar,
              name: userName,
              content: humanMessage,
              timestamp: userTimestamp,
            }),
            createBotMessage({
              avatar: logo,
              isLoading: false,
              name: model ?? selectedModel,
              content: botMessage,
              timestamp: botTimestamp,
            }),
          ],
        );

        newConvoIndex.push(index);
        index++;
      }
      setConversations(_conversations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationsData, userName, avatar, currentConversation, selectedModel]);

  const handleInputPrompt = React.useCallback(
    async (prompt: string) => {
      setConversations((prevConv: Conversations) => {
        return {
          ...prevConv,
          [currentConversation]: [
            ...(prevConv?.[currentConversation] ?? []),
            createUserMessage({
              avatar,
              name: userName,
              content: prompt,
              timestamp: getTimestamp(Date.now()) ?? '',
            }),
            createBotMessage({
              avatar: logo,
              isLoading: true,
              name: selectedModel,
              content: '',
              timestamp: '',
            }),
          ],
        };
      });

      setTimeout(() => {
        scrollToBottomRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 0);
      const finalMessages: string[] = [];

      try {
        const reader = await createMessage({
          prompt,
          selectedModel,
          currentConversation,
        });

        const decoder = new TextDecoder('utf-8');
        const keepGoing = true;
        while (keepGoing) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          const data = splitJsonStrings(chunk) ?? [];
          data?.forEach(line => {
            const trimmedLine = line.trim();
            // Ignore empty lines
            if (!trimmedLine) return;
            try {
              const jsonData = JSON.parse(line);
              const content = jsonData?.response?.kwargs?.content || '';
              finalMessages.push(content);
              setConversations(prevConversations => {
                const conversation = prevConversations[currentConversation];

                if (!conversation) {
                  return prevConversations;
                }
                const lastMessageIndex = conversation.length - 1;
                const lastMessage = { ...conversation[lastMessageIndex] };

                lastMessage.isLoading = false;
                lastMessage.content += content;
                lastMessage.name =
                  jsonData?.response?.kwargs?.response_metadata?.model;
                lastMessage.timestamp = getTimestamp(
                  jsonData?.response?.kwargs?.response_metadata?.created_at ||
                    Date.now(),
                );

                const updatedConversation = [
                  ...conversation.slice(0, lastMessageIndex),
                  lastMessage,
                ];

                return {
                  ...prevConversations,
                  [currentConversation]: updatedConversation,
                };
              });
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn('Error parsing JSON:', error);
              if (typeof onComplete === 'function') {
                onComplete('Invalid JSON received');
              }
            }
          });
        }
      } catch (e) {
        setConversations(prevConversations => {
          const conversation = prevConversations[currentConversation];

          if (!conversation) {
            return prevConversations;
          }
          const lastMessageIndex = conversation.length - 1;
          const lastMessage = { ...conversation[lastMessageIndex] };

          lastMessage.isLoading = false;
          lastMessage.content += e;
          lastMessage.timestamp = getTimestamp(Date.now());

          const updatedConversation = [
            ...conversation.slice(0, lastMessageIndex),
            lastMessage,
          ];

          finalMessages.push(`${e}`);

          return {
            ...prevConversations,
            [currentConversation]: updatedConversation,
          };
        });
      }

      if (typeof onComplete === 'function') {
        onComplete(finalMessages.join(''));
      }
    },

    [
      avatar,
      userName,
      onComplete,
      selectedModel,
      createMessage,
      currentConversation,
    ],
  );

  return {
    conversationMessages: conversations[currentConversation] ?? [],
    handleInputPrompt,
    conversations,
    scrollToBottomRef,
    ...queryProps,
  };
};
