import React from 'react';

import { makeStyles } from '@material-ui/core';
import {
  Chatbot,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotFootnote,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
} from '@patternfly/virtual-assistant';

import { useBackstageUserIdentity } from '../hooks/useBackstageUserIdentity';
import { useConversations } from '../hooks/useConversations';
import { getFootnoteProps } from '../utils/lightspeed-chatbox-utils';
import { LightspeedChatBoxHeader } from './LightspeedChatBoxHeader';

const useStyles = makeStyles(theme => ({
  userMessageText: {
    '& div.pf-chatbot__message--user': {
      '& div.pf-chatbot__message-text': {
        '& p': {
          color: theme.palette.common.white,
        },
      },
    },
  },
  content: {
    '&.pf-chatbot__content': {
      padding: 0,
    },
  },
  footer: {
    '&.pf-chatbot__footer': {
      padding:
        '0 var(--pf-t--global--spacer--lg) var(--pf-t--global--spacer--lg) var(--pf-t--global--spacer--lg)',
    },
  },
}));

type LightspeedChatBoxProps = {
  selectedModel: string;
  userName?: string;
  avatar?: string;
  profileLoading: boolean;
  handleSelectedModel: (item: string) => void;
  models: { label: string; value: string }[];
};

export const LightspeedChatBox = ({
  selectedModel,
  userName,
  avatar,
  profileLoading,
  handleSelectedModel,
  models,
}: LightspeedChatBoxProps) => {
  const classes = useStyles();
  const user = useBackstageUserIdentity();
  const [isSendButtonDisabled, setIsSendButtonDisabled] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string>();

  const conversationId = user ? `${user}+DD4sfxEPLmFoMujg` : ''; // TODO: Replace placeholder ID with actual ID once the Conversation List API is available.

  const onComplete = () => {
    setIsSendButtonDisabled(false);
    setAnnouncement(`Message from Bot: API response goes here`);
  };
  const { conversations, handleInputPrompt, scrollToBottomRef } =
    useConversations(
      conversationId,
      userName,
      selectedModel,
      avatar,
      onComplete,
    );

  const messages = React.useMemo(
    () => conversations[conversationId] ?? [],
    [conversations, conversationId],
  );

  // Auto-scrolls to the latest message
  React.useEffect(() => {
    if (messages.length > 2) {
      scrollToBottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, scrollToBottomRef]);

  const welcomePrompts = [
    {
      title: 'Topic 1',
      message: 'Helpful prompt for Topic 1',
      onClick: () => handleInputPrompt('Helpful prompt for Topic 1'),
    },
    {
      title: 'Topic 2',
      message: 'Helpful prompt for Topic 2',
      onClick: () => handleInputPrompt('Helpful prompt for Topic 2'),
    },
  ];

  return (
    <Chatbot displayMode={ChatbotDisplayMode.embedded}>
      <LightspeedChatBoxHeader
        selectedModel={selectedModel}
        handleSelectedModel={item => handleSelectedModel(item)}
        models={models}
      />
      <ChatbotContent className={classes.content}>
        <MessageBox
          className={classes.userMessageText}
          announcement={announcement}
        >
          <ChatbotWelcomePrompt
            title={`Hello, ${profileLoading ? '...' : (userName ?? 'Guest')}`}
            description="How can I help you today?"
            prompts={!messages.length ? welcomePrompts : []}
          />
          {messages.map((message, index) => {
            if (index === messages.length - 1) {
              return (
                <React.Fragment key={`${message.role}-${index}`}>
                  <Message key={`${message.role}-${index}`} {...message} />
                  <div ref={scrollToBottomRef} />
                </React.Fragment>
              );
            }
            return <Message key={`${message.role}-${index}`} {...message} />;
          })}
        </MessageBox>
      </ChatbotContent>
      <ChatbotFooter className={classes.footer}>
        <MessageBar
          onSendMessage={prompt => {
            setIsSendButtonDisabled(true);
            setAnnouncement(
              `Message from User: ${prompt}. Message from Bot is loading.`,
            );
            handleInputPrompt(prompt);
          }}
          hasMicrophoneButton
          isSendButtonDisabled={isSendButtonDisabled}
        />
        <ChatbotFootnote {...getFootnoteProps()} />
      </ChatbotFooter>
    </Chatbot>
  );
};
