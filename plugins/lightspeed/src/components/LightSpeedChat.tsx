import React from 'react';

import { makeStyles } from '@material-ui/core';
import { DropdownItem, Title } from '@patternfly/react-core';
import {
  Chatbot,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotFootnote,
  ChatbotHeader,
  ChatbotHeaderMain,
  ChatbotHeaderMenu,
  ChatbotHeaderTitle,
  MessageBar,
  MessageProps,
} from '@patternfly/virtual-assistant';
import ChatbotConversationHistoryNav from '@patternfly/virtual-assistant/dist/dynamic/ChatbotConversationHistoryNav';
import { useQueryClient } from '@tanstack/react-query';

import { useBackstageUserIdentity } from '../hooks/useBackstageUserIdentity';
import { useConversationMessages } from '../hooks/useConversationMessages';
import { useConversations } from '../hooks/useConversations';
import { useCreateConversation } from '../hooks/useCreateConversation';
import { useDeleteConversation } from '../hooks/useDeleteConversation';
import { ConversationSummary } from '../types';
import {
  getCategorizeMessages,
  getFootnoteProps,
} from '../utils/lightspeed-chatbox-utils';
import { LightspeedChatBox } from './LightspeedChatBox';
import { LightspeedChatBoxHeader } from './LightspeedChatBoxHeader';

const useStyles = makeStyles(theme => ({
  content: {
    '&.pf-chatbot__content': {
      padding: 0,
    },
  },
  header: {
    padding: `${theme.spacing(3)}px !important`,
  },
  headerTitle: {
    justifyContent: 'left !important',
  },
  footer: {
    '&.pf-chatbot__footer': {
      padding:
        '0 var(--pf-t--global--spacer--lg) var(--pf-t--global--spacer--lg) var(--pf-t--global--spacer--lg)',
    },
  },
}));

type LightspeedChatProps = {
  selectedModel: string;
  userName?: string;
  avatar?: string;
  profileLoading: boolean;
  handleSelectedModel: (item: string) => void;
  models: { label: string; value: string }[];
};

export const LightspeedChat = ({
  selectedModel,
  userName,
  avatar,
  profileLoading,
  handleSelectedModel,
  models,
}: LightspeedChatProps) => {
  const classes = useStyles();
  const user = useBackstageUserIdentity();
  const [filterValue, setFilterValue] = React.useState<string>('');
  const [announcement, setAnnouncement] = React.useState<string>('');
  const [conversationId, setConversationId] = React.useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(true);
  const [newChatCreated, setNewChatCreated] = React.useState<boolean>(true);
  const [isSendButtonDisabled, setIsSendButtonDisabled] =
    React.useState<boolean>(false);

  const queryClient = useQueryClient();

  const { mutateAsync: createConversation } = useCreateConversation();
  const { data: conversations = [], isFetching: isFetchingConversations } =
    useConversations();
  const { mutateAsync: deleteConversation, isPending: isDeleting } =
    useDeleteConversation();

  React.useEffect(() => {
    if (user) {
      createConversation()
        .then(({ conversation_id }) => {
          setConversationId(conversation_id);
        })
        .catch(e => {
          // eslint-disable-next-line
          console.warn(e);
        });
    }
  }, [user, setConversationId, createConversation]);

  const onComplete = (message: string) => {
    setIsSendButtonDisabled(false);
    setAnnouncement(`Message from Bot: ${message}`);
    queryClient.invalidateQueries({
      queryKey: ['conversations'],
    });
  };

  const { conversationMessages, handleInputPrompt, scrollToBottomRef } =
    useConversationMessages(
      conversationId,
      userName,
      selectedModel,
      avatar,
      onComplete,
    );

  const [messages, setMessages] =
    React.useState<MessageProps[]>(conversationMessages);

  // Auto-scrolls to the latest message
  React.useEffect(() => {
    if (messages.length > 2) {
      setTimeout(() => {
        scrollToBottomRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 10);
    }
    // eslint-disable-next-line
  }, [messages, scrollToBottomRef.current]);

  const sendMessage = (message: string) => {
    setNewChatCreated(false);
    setAnnouncement(
      `Message from User: ${prompt}. Message from Bot is loading.`,
    );
    handleInputPrompt(message);
    setIsSendButtonDisabled(true);
  };

  const onNewChat = React.useCallback(() => {
    (async () => {
      setMessages([]);
      const { conversation_id } = await createConversation();
      setConversationId(conversation_id);
      setNewChatCreated(true);
    })();
  }, [createConversation, setConversationId, setMessages]);

  const additionalMessageProps = React.useCallback(
    (conversationSummary: ConversationSummary) => ({
      menuItems: (
        <DropdownItem
          isDisabled={isDeleting || isFetchingConversations}
          onClick={async () => {
            try {
              await deleteConversation({
                conversation_id: conversationSummary.conversation_id,
                invalidateCache: false,
              });
              onNewChat();
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn({ error });
            }
          }}
        >
          Delete
        </DropdownItem>
      ),
    }),
    [deleteConversation, onNewChat, isDeleting, isFetchingConversations],
  );
  const categorizedMessages = getCategorizeMessages(
    conversations,
    additionalMessageProps,
  );

  const filterConversations = React.useCallback(
    (targetValue: string) => {
      const filteredConversations = Object.entries(categorizedMessages).reduce(
        (acc, [key, items]) => {
          const filteredItems = items.filter(item =>
            item.text.toLowerCase().includes(targetValue.toLowerCase()),
          );
          if (filteredItems.length > 0) {
            acc[key] = filteredItems;
          }
          return acc;
        },
        {} as any,
      );
      return filteredConversations;
    },
    [categorizedMessages],
  );

  React.useEffect(() => {
    setMessages(conversationMessages);
  }, [conversationMessages]);

  const onSelectActiveItem = React.useCallback(
    (
      _: React.MouseEvent | undefined,
      selectedItem: string | number | undefined,
    ) => {
      setNewChatCreated(false);
      setConversationId((c_id: string) => {
        if (c_id !== selectedItem) {
          return String(selectedItem);
        }
        return c_id;
      });
    },
    [setConversationId],
  );

  const welcomePrompts = newChatCreated
    ? [
        {
          title: 'Topic 1',
          message: 'Helpful prompt for Topic 1',
          onClick: () => sendMessage('Helpful prompt for Topic 1'),
        },
        {
          title: 'Topic 2',
          message: 'Helpful prompt for Topic 2',
          onClick: () => sendMessage('Helpful prompt for Topic 2'),
        },
      ]
    : [];

  const handleFilter = React.useCallback((value: string) => {
    setFilterValue(value);
  }, []);

  const onDrawerToggle = React.useCallback(() => {
    setIsDrawerOpen(isOpen => !isOpen);
  }, []);

  return (
    <>
      <Chatbot displayMode={ChatbotDisplayMode.embedded}>
        <ChatbotConversationHistoryNav
          displayMode={ChatbotDisplayMode.embedded}
          onDrawerToggle={onDrawerToggle}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          activeItemId={conversationId}
          onSelectActiveItem={onSelectActiveItem}
          conversations={filterConversations(filterValue)}
          onNewChat={newChatCreated ? undefined : onNewChat}
          handleTextInputChange={handleFilter}
          drawerContent={
            <>
              <ChatbotHeader className={classes.header}>
                <ChatbotHeaderMain>
                  <ChatbotHeaderMenu
                    aria-expanded={isDrawerOpen}
                    onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)}
                  />
                  <ChatbotHeaderTitle className={classes.headerTitle}>
                    <Title headingLevel="h1" size="3xl">
                      Developer Hub Lightspeed
                    </Title>
                  </ChatbotHeaderTitle>
                </ChatbotHeaderMain>

                <LightspeedChatBoxHeader
                  selectedModel={selectedModel}
                  handleSelectedModel={item => handleSelectedModel(item)}
                  models={models}
                />
              </ChatbotHeader>

              <ChatbotContent className={classes.content}>
                <LightspeedChatBox
                  userName={userName}
                  messages={messages}
                  profileLoading={profileLoading}
                  announcement={announcement}
                  ref={scrollToBottomRef}
                  welcomePrompts={welcomePrompts}
                />
              </ChatbotContent>
              <ChatbotFooter className={classes.footer}>
                <MessageBar
                  onSendMessage={sendMessage}
                  isSendButtonDisabled={isSendButtonDisabled}
                  hasAttachButton={false}
                />
                <ChatbotFootnote {...getFootnoteProps()} />
              </ChatbotFooter>
            </>
          }
        />
      </Chatbot>
    </>
  );
};
