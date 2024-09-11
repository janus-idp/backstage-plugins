import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

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
  MessageProps,
} from '@patternfly/virtual-assistant';

import { lightspeedApiRef } from '../api/LightspeedProxyClient';
import { Conversations } from '../types';
import {
  getFootnoteProps,
  getTimestamp,
} from '../utils/lightspeed-chatbox-utils';
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
  const lightspeedApi = useApi(lightspeedApiRef);
  const [, setChunkIndex] = React.useState(0);
  const classes = useStyles();
  const [convoIndex, setConvoIndex] = React.useState<number[]>([0]);
  const [messages, setMessages] = React.useState<Conversations>({});
  const convoCounter = convoIndex.length - 1;

  const context_template = Object.values(messages)
    .map(convo => `USER: ${convo.user}\nBOT: ${convo.bot}`)
    .join('\n\n');

  const handleInputPrompt = React.useCallback(
    async (prompt: string) => {
      setMessages(m => {
        m[convoCounter] = {
          user: prompt,
          bot: '',
          model: selectedModel,
          loading: true,
          timestamp: '',
        };
        return m;
      });
      setChunkIndex(0);

      const latestQuestion = `Respond to the users current message\n\nCONTEXT: ${context_template}\n\nCURRENT QUESTION: ${prompt}`;
      const result = await lightspeedApi.createChatCompletions(
        `${latestQuestion}`,
        selectedModel,
      );

      let chunkNumber = 1;
      for await (const chunk of result) {
        setChunkIndex(index => index + 1);
        // eslint-disable-next-line no-loop-func
        setMessages(m => {
          m[convoCounter] = {
            ...m[convoCounter],
            bot: `${m[`${convoCounter}`]?.bot || ''}${chunk.choices[0]?.delta?.content || ''}`,
            loading: false,
            ...(chunkNumber === 1
              ? { timestamp: getTimestamp(chunk.created) }
              : {}),
          };
          return m;
        });
        chunkNumber++;
      }
      setConvoIndex(conIndex => [...conIndex, convoCounter + 1]);
    },
    [context_template, convoCounter, lightspeedApi, selectedModel],
  );

  const transformedMessages = Object.values(messages)
    .map(msg => [
      {
        role: 'user',
        content: msg.user,
        name: `${userName}`,
        avatar,
      },
      {
        role: 'bot',
        content: msg.bot,
        name: `${msg.model}`,
        isLoading: msg.loading,
        timestamp: msg.timestamp,
      },
    ])
    .flat() as MessageProps[];

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
    <>
      <Chatbot displayMode={ChatbotDisplayMode.embedded}>
        <LightspeedChatBoxHeader
          selectedModel={selectedModel}
          handleSelectedModel={item => handleSelectedModel(item)}
          models={models}
        />
        <ChatbotContent>
          <MessageBox className={classes.userMessageText}>
            <ChatbotWelcomePrompt
              title={`Hello, ${profileLoading ? '...' : userName}`}
              description="How can I help you today?"
              prompts={!transformedMessages.length ? welcomePrompts : []}
            />
            {transformedMessages.map((message, index) => (
              <Message key={`${message.role}-${index}`} {...message} />
            ))}
          </MessageBox>
        </ChatbotContent>
        <ChatbotFooter>
          <MessageBar onSendMessage={handleInputPrompt} hasMicrophoneButton />
          <ChatbotFootnote {...getFootnoteProps()} />
        </ChatbotFooter>
      </Chatbot>
    </>
  );
};
