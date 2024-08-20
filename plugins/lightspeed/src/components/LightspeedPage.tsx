import React from 'react';

import { Content, Header, HeaderLabel, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Paper } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import { lightspeedApiRef } from '../api/LightspeedProxyClient';
import { LightspeedInput } from './LightspeedInput';
import { SystemMessage, UserMessage } from './Message';

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      width: '70%',
      height: '100%',
      maxHeight: '740px',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      position: 'relative',
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    messagesBody: {
      width: 'calc( 100% - 20px )',
      padding: 10,
      overflowY: 'scroll',
      height: 'calc( 100% - 80px )',
    },
  }),
);

export const LightspeedPage = () => {
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
    [context_template, convoCounter, lightspeedApi],
  );

  return (
    <Page themeId="tool">
      <Header
        title="Red Hat Developer Hub Lightspeed"
        subtitle="A new way to interact with LLMs inside Developer Hub."
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content className={classes.container}>
        <Paper className={classes.paper} elevation={2}>
          <Paper id="style-1" className={classes.messagesBody}>
            {convoIndex.map(id => (
              <>
                {messages[id]?.user && (
                  <UserMessage message={messages[id].user} />
                )}
                {messages[id]?.assistant && (
                  <SystemMessage message={messages[id].assistant} />
                )}
              </>
            ))}
          </Paper>
          <LightspeedInput onSubmit={handleInputPrompt} />
        </Paper>
      </Content>
    </Page>
  );
};
