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
  const [prompts, setPrompts] = React.useState<string[]>([]);
  const [completions, setCompletions] = React.useState<{
    [key: string]: string;
  }>({});

  const handleInputPrompt = React.useCallback(
    async (prompt: string) => {
      setPrompts(p => [...p, prompt]);
      setChunkIndex(0);

      const result = await lightspeedApi.createChatCompletions(prompt);
      setCompletions(c => {
            c[prompt] = `${c[prompt] || ''}${result?.toString() || ''}`;
            return c;
      });

      // for (const chunk of result) {
      //   setChunkIndex(index => index + 1);
      //   setCompletions(c => {
      //     c[prompt] =
      //       `${c[prompt] || ''}${chunk.choices[0]?.delta?.content || ''}`;
      //     return c;
      //   });
      // }
    },
    [lightspeedApi],
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
            {prompts.map(prompt => (
              <>
                {prompt && <UserMessage message={prompt} />}
                {completions[prompt] && (
                  <SystemMessage message={completions[prompt]} />
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
