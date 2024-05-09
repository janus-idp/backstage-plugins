import { PluginBuildMetadata } from '@openshift/dynamic-plugin-sdk-webpack';

import { buildScalprumBundle } from '../bundler/bundlePlugin';
import { getEnvironmentParallelism } from '../parallel';

interface BuildScalprumPluginOptions {
  targetDir: string;
  writeStats: boolean;
  configPaths: string[];
  pluginMetadata: PluginBuildMetadata;
  resolvedScalprumDistPath: string;
}

export async function buildScalprumPlugin(options: BuildScalprumPluginOptions) {
  const { targetDir, pluginMetadata, resolvedScalprumDistPath } = options;
  await buildScalprumBundle({
    targetDir,
    entry: 'src/index',
    parallelism: getEnvironmentParallelism(),
    pluginMetadata,
    resolvedScalprumDistPath,
  });
}
