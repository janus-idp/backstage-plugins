import React from 'react';
import { useAsync } from 'react-use';

import { Content, Header, Page, Select } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { LinearProgress, Paper } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import { lightspeedApiRef } from '../api/LightspeedProxyClient';
import { LightspeedChatBox } from './LightspeedChatBox';

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

  const { value: models, loading } = useAsync(
    async () => await lightspeedApi.getAllModels(),
  );
  const [selectedModel, setSelectedModel] = React.useState('');

  const modelsItems = React.useMemo(
    () => (models ? models.map(m => ({ label: m.id, value: m.id })) : []),
    [models],
  );

  React.useEffect(() => {
    if (modelsItems.length > 0) setSelectedModel(modelsItems[0].value);
  }, [modelsItems]);

  return (
    <Page themeId="tool">
      <Header
        title="Red Hat Developer Hub Lightspeed"
        subtitle="A new way to interact with LLMs inside Developer Hub."
      >
        {loading && <LinearProgress />}
        {!loading && models && (
          <Select
            onChange={item => setSelectedModel(item as string)}
            items={modelsItems}
            selected={selectedModel}
            disabled={loading}
            margin="dense"
            label="Select LLM Model"
          />
        )}
      </Header>
      <Content className={classes.container}>
        <Paper className={classes.paper} elevation={2}>
          <LightspeedChatBox selectedModel={selectedModel} />
        </Paper>
      </Content>
    </Page>
  );
};
