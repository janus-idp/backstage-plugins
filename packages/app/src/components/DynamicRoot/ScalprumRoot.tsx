/* eslint-disable @typescript-eslint/no-shadow */

import React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { AppConfig } from '@backstage/config';
import { ConfigReader, defaultConfigLoader } from '@backstage/core-app-api';
import { AnyApiFactory } from '@backstage/core-plugin-api';

import { AppsConfig } from '@scalprum/core';
import { ScalprumProvider } from '@scalprum/react-core';

import overrideBaseUrlConfigs from '../../utils/dynamicUI/overrideBaseUrlConfigs';
import { DynamicRoot, StaticPlugins } from './DynamicRoot';
import Loader from './Loader';

const ScalprumRoot = ({
  apis,
  afterInit,
  baseFrontendConfig,
  plugins,
}: {
  // Static APIs
  apis: AnyApiFactory[];
  afterInit: () => Promise<{ default: React.ComponentType }>;
  baseFrontendConfig?: AppConfig;
  plugins?: StaticPlugins;
}) => {
  const { loading, value } = useAsync(
    async (): Promise<{
      appConfig: AppConfig[];
      baseUrl: string;
      scalprumConfig?: AppsConfig;
    }> => {
      const appConfig = overrideBaseUrlConfigs(await defaultConfigLoader());
      const reader = ConfigReader.fromConfigs(appConfig);
      const baseUrl = reader.getString('backend.baseUrl');
      try {
        const scalprumConfig: AppsConfig = await fetch(
          `${baseUrl}/api/scalprum/plugins`,
        ).then(r => r.json());
        return {
          appConfig,
          baseUrl,
          scalprumConfig,
        };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `Failed to fetch scalprum configuration: ${JSON.stringify(err)}`,
        );
        return {
          appConfig,
          baseUrl,
          scalprumConfig: {},
        };
      }
    },
  );
  if (loading && !value) {
    return <Loader />;
  }
  const { appConfig, baseUrl, scalprumConfig } = value || {};
  return (
    <ScalprumProvider
      config={scalprumConfig ?? {}}
      pluginSDKOptions={{
        pluginLoaderOptions: {
          transformPluginManifest: manifest => {
            return {
              ...manifest,
              loadScripts: manifest.loadScripts.map(
                (script: string) =>
                  `${baseUrl ?? ''}/api/scalprum/${manifest.name}/${script}`,
              ),
            };
          },
        },
      }}
    >
      <DynamicRoot
        afterInit={afterInit}
        apis={apis}
        appConfig={appConfig ?? []}
        baseFrontendConfig={baseFrontendConfig ?? { context: '', data: {} }}
        staticPluginStore={plugins}
        scalprumConfig={scalprumConfig ?? {}}
      />
    </ScalprumProvider>
  );
};

export default ScalprumRoot;
