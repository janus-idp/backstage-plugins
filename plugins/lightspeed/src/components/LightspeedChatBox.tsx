import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { createStyles, makeStyles, Paper } from '@material-ui/core';

import { lightspeedApiRef } from '../api/LightspeedProxyClient';
import { LightspeedInput } from './LightspeedInput';
import { SystemMessage, UserMessage } from './Message';

const useStyles = makeStyles(() =>
  createStyles({
    messagesBody: {
      width: 'calc( 100% - 20px )',
      padding: 10,
      overflowY: 'scroll',
      height: 'calc( 100% - 80px )',
    },
  }),
);

export const LightspeedChatBox = ({
  selectedModel,
}: {
  selectedModel: string;
}) => {
  const classes = useStyles();
  const lightspeedApi = useApi(lightspeedApiRef);
  const [, setChunkIndex] = React.useState(0);
  const [convoIndex, setConvoIndex] = React.useState<number[]>([0]);
  const [messages, setMessages] = React.useState<{
    [key: string]: { user: string; assistant: string };
  }>({});

  const convoCounter = convoIndex.length - 1;

  const context_template = Object.values(messages)
    .map(convo => `USER: ${convo.user}\nASSISTANT: ${convo.assistant}`)
    .join('\n\n');

  const handleInputPrompt = React.useCallback(
    async (prompt: string) => {
      setChunkIndex(0);
      setMessages(m => {
        m[convoCounter] = {
          user: prompt,
          assistant: '',
        };
        return m;
      });

      const latestQuestion = `Respond to the users current message\n\nCONTEXT: ${context_template}\n\nCURRENT QUESTION: ${prompt}`;

      const result = await lightspeedApi.createChatCompletions(
        `${latestQuestion}`,
        selectedModel,
      );
      for await (const chunk of result) {
        setChunkIndex(index => index + 1);
        setMessages(m => {
          m[convoCounter] = {
            ...m[convoCounter],
            assistant: `${m[`${convoCounter}`]?.assistant || ''}${chunk.choices[0]?.delta?.content || ''}`,
          };
          return m;
        });
      }
      setConvoIndex(conIndex => [...conIndex, convoCounter + 1]);
    },
    [context_template, convoCounter, lightspeedApi, selectedModel],
  );

  return (
    <>
      <Paper id="style-1" className={classes.messagesBody}>
        {convoIndex.map(id => (
          <>
            {messages[id]?.user && (
              <UserMessage key={`user-${id}`} message={messages[id].user} />
            )}
            {messages[id]?.assistant && (
              <SystemMessage
                key={`assistant-${id}`}
                message={messages[id].assistant}
              />
            )}
          </>
        ))}
      </Paper>
      <LightspeedInput onSubmit={handleInputPrompt} disabled={!selectedModel} />
    </>
  );
};
