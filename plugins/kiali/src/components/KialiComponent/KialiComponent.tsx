import React from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';

import {
  CardTab,
  CodeSnippet,
  Content,
  Page,
  TabbedCard,
  WarningPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { CircularProgress } from '@material-ui/core';

import {
  AuthStrategy,
  DefaultKialiConfig,
  INITIAL_STATUS_STATE,
  KialiConfigT,
  KialiFetchError,
  KialiInfo,
  Namespace,
  setServerConfig,
} from '@janus-idp/backstage-plugin-kiali-common';

import { kialiApiRef } from '../../api';
import { handleMultipleMessage } from '../../helper';
import { Overview } from '../Overview';
import { KialiHeader } from './Header';

const getPathPage = () => {
  const pathname = window.location.pathname.split('/').pop() || 'overview';
  return pathname === 'kiali' ? 'overview' : pathname;
};

export const KialiComponent = () => {
  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(useEntity().entity);
  const [kialiTab, setKialiTab] = React.useState<string>(getPathPage());
  const [kialiConfig, setKialiConfig] =
    React.useState<KialiConfigT>(DefaultKialiConfig);
  const [kialiStatus, setKialiStatus] = React.useState<KialiInfo>({
    status: INITIAL_STATUS_STATE,
    auth: { sessionInfo: {}, strategy: AuthStrategy.anonymous },
  });
  const [namespacesFiltered, setNamespacesFiltered] = React.useState<string[]>(
    [],
  );
  const [namespaces, setNamespaces] = React.useState<Namespace[]>([]);
  const [errors, setErrors] = React.useState<KialiFetchError[]>([]);

  const fetchConfig = async () => {
    let config = kialiConfig;
    if (config.kialiConsole === '') {
      await kialiClient.getConfig().then(resp => {
        if (resp.errors.length > 0) {
          setErrors(resp.errors);
        }
        config = resp.response as KialiConfigT;
        config.server = setServerConfig(kialiConfig?.server, config.server);
        setKialiConfig(config);
      });
    }
  };

  const fetchNamespaces = async () => {
    await kialiClient.getNamespaces().then(resp => {
      if (resp.errors.length > 0) {
        setErrors(resp.errors);
      }
      setNamespaces(resp.response as Namespace[]);
      setNamespacesFiltered((resp.response as Namespace[]).map(ns => ns.name));
    });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      await kialiClient.getInfo().then(response => {
        if (response.errors.length > 0) {
          setErrors(response.errors);
        } else {
          setKialiStatus(response.response as KialiInfo);
          fetchConfig();
          fetchNamespaces();
        }
      }); // Check if the config is loaded
    },
    [],
    { loading: true },
  );

  useDebounce(refresh, 10);

  return loading ? (
    <CircularProgress />
  ) : (
    <Page themeId="tool">
      <Content>
        <KialiHeader
          title="Kiali"
          kialiStatus={kialiStatus}
          config={kialiConfig}
          namespaces={namespaces}
          setNamespaceFilter={setNamespacesFiltered}
          namespacesFiltered={namespacesFiltered}
        />
        {errors.length > 0 && (
          <WarningPanel
            severity="error"
            title="Could not fetch info from Kiali."
          >
            <CodeSnippet text={handleMultipleMessage(errors)} language="text" />
          </WarningPanel>
        )}
        {kialiConfig.kialiConsole !== '' && (
          <>
            <TabbedCard
              value={kialiTab}
              onChange={(_, v) => setKialiTab(v as string)}
            >
              {/* 
                // @ts-ignore */}
              <CardTab value="overview" label="Overview">
                <Overview kialiConfig={kialiConfig} kialiStatus={kialiStatus} namespacesFiltered={namespacesFiltered}/>
              </CardTab>
            </TabbedCard>
          </>
        )}
      </Content>
    </Page>
  );
};
