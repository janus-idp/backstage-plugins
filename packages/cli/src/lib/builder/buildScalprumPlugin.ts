import { PluginBuildMetadata } from '@openshift/dynamic-plugin-sdk-webpack';

import { buildScalprumBundle } from '../bundler/bundlePlugin';
import { loadCliConfig } from '../config';
import { getEnvironmentParallelism } from '../parallel';

interface BuildScalprumPluginOptions {
  targetDir: string;
  writeStats: boolean;
  configPaths: string[];
  pluginMetadata: PluginBuildMetadata;
  fromPackage: string;
}

export async function buildScalprumPlugin(options: BuildScalprumPluginOptions) {
  const { targetDir, pluginMetadata, fromPackage } = options;
  await buildScalprumBundle({
    targetDir,
    entry: 'src/index',
    parallelism: getEnvironmentParallelism(),
    pluginMetadata,
    ...(await loadCliConfig({
      args: [],
      fromPackage,
    })),
  });
}
