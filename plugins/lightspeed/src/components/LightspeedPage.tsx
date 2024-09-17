import React from 'react';
import { useAsync } from 'react-use';

import { Content, Page } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';

import { lightspeedApiRef } from '../api/LightspeedProxyClient';
import { LightspeedChatBox } from './LightspeedChatBox';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      padding: '0px',
    },
  }),
);

const THEME_DARK = 'dark';
const THEME_DARK_CLASS = 'pf-v6-theme-dark';

export const LightspeedPage = () => {
  const classes = useStyles();
  const {
    palette: { type },
  } = useTheme();

  const lightspeedApi = useApi(lightspeedApiRef);
  const identityApi = useApi(identityApiRef);

  const { value: models } = useAsync(
    async () => await lightspeedApi.getAllModels(),
  );

  const { value: profile, loading: profileLoading } = useAsync(
    async () => await identityApi.getProfileInfo(),
  );

  const [selectedModel, setSelectedModel] = React.useState('');

  const modelsItems = React.useMemo(
    () => (models ? models.map(m => ({ label: m.id, value: m.id })) : []),
    [models],
  );

  React.useEffect(() => {
    const htmlTagElement = document.documentElement;
    if (type === THEME_DARK) {
      htmlTagElement.classList.add(THEME_DARK_CLASS);
    } else {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  React.useEffect(() => {
    if (modelsItems.length > 0) setSelectedModel(modelsItems[0].value);
  }, [modelsItems]);

  return (
    <Page themeId="tool">
      <Content className={classes.container}>
        <LightspeedChatBox
          selectedModel={selectedModel}
          handleSelectedModel={item => {
            setSelectedModel(item);
          }}
          models={modelsItems}
          userName={profile?.displayName}
          avatar={profile?.picture}
          profileLoading={profileLoading}
        />
      </Content>
    </Page>
  );
};
