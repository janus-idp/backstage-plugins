import React, { useMemo } from 'react';

import { createApp } from '@backstage/frontend-app-api';
import { BackstagePlugin } from '@backstage/frontend-plugin-api';

import { AppsConfig, getScalprum, processManifest } from '@scalprum/core';
import { ScalprumProvider, useScalprum } from '@scalprum/react-core';

import { pagesPlugin } from './examples/pagesPlugin';

const extensionsConfig = [
  {
    'apis.plugin.graphiql.browse.gitlab': true,
  },
  {
    'dynamic.plugin.scalprum.page': {
      config: {
        dynamic: {
          pluginName: 'janus.dynamic-frontend-plugin',
          assetsHost: 'http://localhost:8004',
          module: './DummyDynamicComponent',
          title: 'Custom title prop',
        },
        path: '/dynamic',
      },
    },
  },
];

type ScalprumExtensionConfig = {
  config: {
    dynamic: {
      pluginName: string;
      assetsHost: string;
      module: string;
    };
  };
};
// name: config.dynamic.pluginName,
// manifestLocation: `${config.dynamic.assetsHost}/plugin-manifest.json`,
// assetsHost: config.dynamic.assetsHost
function isScalprumAppMetadata(item: any): item is ScalprumExtensionConfig {
  if (
    typeof item !== 'object' ||
    typeof item.config !== 'object' ||
    typeof item.config.dynamic !== 'object'
  ) {
    return false;
  }
  const {
    config: { dynamic },
  } = item;
  return (
    typeof dynamic?.pluginName === 'string' &&
    typeof dynamic.assetsHost === 'string'
  );
}

const scalprumConfig: AppsConfig<{
  assetsHost: string;
}> = (Array.isArray(extensionsConfig) ? extensionsConfig : []).reduce<
  AppsConfig<{ assetsHost: string }>
>((acc, curr) => {
  if (typeof curr === 'object') {
    const dynamicObjects: AppsConfig<{ assetsHost: string }> = {};
    Object.values(curr as {}).forEach(item => {
      if (isScalprumAppMetadata(item)) {
        const {
          config: {
            dynamic: { pluginName, assetsHost },
          },
        } = item;
        dynamicObjects[pluginName] = {
          name: pluginName,
          manifestLocation: `${assetsHost}/plugin-manifest.json`,
          assetsHost,
        };
      }
    });
    return {
      ...acc,
      ...dynamicObjects,
    };
  }
  return acc;
}, {});

// list of remote plugins to load
// both plugins (module) are exposed in the same remote container
// plugins can be from multiple different remotes
const requiredPlugins = ['./TechRadarPlugin', './GraphiqlPlugin'];

const BackstageRoot = () => {
  const root = useMemo(() => {
    const app = createApp({
      // statically defined plugins
      plugins: [pagesPlugin],
      pluginLoader: async () => {
        /**
         * Preload all plugins container entry entry points on app boostrap.
         * This is required because plugins have to be loaded at backstage boostrap and they cannot be added at runtime.
         */
        const { pluginStore } = getScalprum();
        // initializes the remote container in scalprum for each plugin module
        const manifestInitializations = requiredPlugins.map(plugin =>
          processManifest(
            scalprumConfig['janus.dynamic-frontend-plugin'].manifestLocation!,
            'janus.dynamic-frontend-plugin',
            plugin,
          ),
        );
        await Promise.all(manifestInitializations);
        // extra plugin module definition from scalprum plugin store
        const pluginModules = await Promise.all(
          requiredPlugins.map(moduleId =>
            pluginStore.getExposedModule<{ default: BackstagePlugin }>(
              'janus.dynamic-frontend-plugin',
              moduleId,
            ),
          ),
        );
        const [techRadarPlugin, graphiQlPlugin] = await pluginModules;
        // return registered plugins
        return [techRadarPlugin.default, graphiQlPlugin.default];
      },
    });
    return app.createRoot();
  }, []);
  return root;
};

// Root that blocks rendering after scalprum is initialized
const ScalprumRoot = () => {
  const scalprum = useScalprum();
  if (!scalprum.initialized) {
    return null;
  }

  return <BackstageRoot />;
};

// This wrapper is supposed to be in the root, but currently we can't add it because the root wrapper components can't be configured.
const ExtendedRoot = () => {
  return (
    <ScalprumProvider
      pluginSDKOptions={{
        pluginLoaderOptions: {
          postProcessManifest: manifest => {
            return {
              ...manifest,
              loadScripts: manifest.loadScripts.map(
                script =>
                  `${scalprumConfig[manifest.name].assetsHost}/${script}`,
              ),
            };
          },
        },
      }}
      config={scalprumConfig}
    >
      <ScalprumRoot />
    </ScalprumProvider>
  );
};
export default <ExtendedRoot />;
