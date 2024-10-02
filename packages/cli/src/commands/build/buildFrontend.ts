/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PluginBuildMetadata } from '@openshift/dynamic-plugin-sdk-webpack';
import fs from 'fs-extra';

import { resolve as resolvePath } from 'path';

import { buildBundle } from '../../lib/bundler';
import { loadCliConfig } from '../../lib/config';
import { getEnvironmentParallelism } from '../../lib/parallel';

interface BuildAppOptions {
  targetDir: string;
  writeStats: boolean;
  configPaths: string[];
  pluginMetadata?: PluginBuildMetadata;
}

/*
 * A variant of buildFrontend that adds plugin metadata to support dynamic
 * frontend plugins.
 */
export async function buildFrontend(options: BuildAppOptions) {
  const { targetDir, writeStats, configPaths, pluginMetadata } = options;
  const { name } = await fs.readJson(resolvePath(targetDir, 'package.json'));
  await buildBundle({
    targetDir,
    entry: 'src/index',
    parallelism: getEnvironmentParallelism(),
    statsJsonEnabled: writeStats,
    pluginMetadata,
    ...(await loadCliConfig({
      args: configPaths,
      fromPackage: name,
    })),
  });
}
