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
  DefaultKialiConfig,
  KialiConfigT,
  KialiFetchError,
  setServerConfig,
} from '@janus-idp/backstage-plugin-kiali-common';

import { kialiApiRef } from '../../api';
import { KialiEndpoints } from '../../api/apiClient';
import { Overview } from '../Overview';

export const KialiComponent = () => {
  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(useEntity().entity);
  const [kialiConfig, setKialiConfig] =
    React.useState<KialiConfigT>(DefaultKialiConfig);
  const [errors, setErrors] = React.useState<KialiFetchError[]>([]);
  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      let config = kialiConfig;
      if (config.kialiConsole === '') {
        await kialiClient.get(KialiEndpoints.getConfig).then(response => {
          if (response.errors.length > 0) {
            setErrors(response.errors);
          }
          config = response.response as KialiConfigT;
          config.server = setServerConfig(kialiConfig?.server, config.server);
          setKialiConfig(config);
        });
      }
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);
  if (errors.length > 0) {
    const message = errors
      .map(
        e =>
          `Error ${e.errorType.toString()}, Code: ${e.statusCode} fetching ${
            e.resourcePath
          } :  ${e.message}`,
      )
      .join('\n');
    return (
      <WarningPanel severity="error" title="Could not fetch info from Kiali.">
        <CodeSnippet language="text" text={message} />
      </WarningPanel>
    );
  }

  return (
    <Page themeId="tool">
      <Content>
        {loading ? (
          <CircularProgress />
        ) : (
          <TabbedCard title="Kiali">
            {/* 
          // @ts-ignore */}
            <CardTab label="Overview">
              <Overview kialiConfig={kialiConfig} />
            </CardTab>
          </TabbedCard>
        )}
      </Content>
    </Page>
  );
};
