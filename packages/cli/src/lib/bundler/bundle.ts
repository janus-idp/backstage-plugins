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

import yn from 'yn';
import fs from 'fs-extra';
import { resolve as resolvePath } from 'path';
import webpack from 'webpack';
import {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} from 'react-dev-utils/FileSizeReporter';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import { createConfig, resolveBaseUrl } from './config';
import { BuildOptions } from './types';
import { resolveBundlingPaths } from './paths';
import chalk from 'chalk';

// TODO(Rugvip): Limits from CRA, we might want to tweak these though.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

export async function buildBundle(options: BuildOptions) {
  const { statsJsonEnabled, schema: configSchema } = options;

  const paths = resolveBundlingPaths(options);
  const config = await createConfig(paths, {
    ...options,
    checksEnabled: false,
    isDev: false,
    baseUrl: resolveBaseUrl(options.frontendConfig),
  });
  const compiler = webpack(config);

  const isCi = yn(process.env.CI, { default: false });

  const previousFileSizes = await measureFileSizesBeforeBuild(paths.targetDist);
  await fs.emptyDir(paths.targetDist);

  if (paths.targetPublic) {
    await fs.copy(paths.targetPublic, paths.targetDist, {
      dereference: true,
      filter: file => file !== paths.targetHtml,
    });
  }

  if (configSchema) {
    await fs.writeJson(
      resolvePath(paths.targetDist, '.config-schema.json'),
      configSchema.serialize(),
      { spaces: 2 },
    );
  }

  const { stats } = await build(compiler, isCi).catch(error => {
    console.log(chalk.red('Failed to compile.\n'));
    throw new Error(`Failed to compile.\n${error.message || error}`);
  });

  if (!stats) {
    throw new Error('No stats returned');
  }

  if (statsJsonEnabled) {
    // No @types/bfj
    await require('bfj').write(
      resolvePath(paths.targetDist, 'bundle-stats.json'),
      stats.toJson(),
    );
  }

  printFileSizesAfterBuild(
    stats,
    previousFileSizes,
    paths.targetDist,
    WARN_AFTER_BUNDLE_GZIP_SIZE,
    WARN_AFTER_CHUNK_GZIP_SIZE,
  );
}

async function build(compiler: webpack.Compiler, isCi: boolean) {
  const stats = await new Promise<webpack.Stats | undefined>(
    (resolve, reject) => {
      compiler.run((err, buildStats) => {
        if (err) {
          if (err.message) {
            const { errors } = formatWebpackMessages({
              errors: [err.message],
              warnings: new Array<string>(),
              _showErrors: true,
              _showWarnings: true,
            });

            throw new Error(errors[0]);
          } else {
            reject(err);
          }
        } else {
          resolve(buildStats);
        }
      });
    },
  );

  if (!stats) {
    throw new Error('No stats provided');
  }

  const serializedStats = stats.toJson({
    all: false,
    warnings: true,
    errors: true,
  });
  // NOTE(freben): The code below that extracts the message part of the errors,
  // is due to react-dev-utils not yet being compatible with webpack 5. This
  // may be possible to remove (just passing the serialized stats object
  // directly into the format function) after a new release of react-dev-utils
  // has been made available.
  // See https://github.com/facebook/create-react-app/issues/9880
  const { errors, warnings } = formatWebpackMessages({
    errors: serializedStats.errors?.map(e => (e.message ? e.message : e)),
    warnings: serializedStats.warnings?.map(e => (e.message ? e.message : e)),
  });

  if (errors.length) {
    // Only keep the first error. Others are often indicative
    // of the same problem, but confuse the reader with noise.
    throw new Error(errors[0]);
  }
  if (isCi && warnings.length) {
    console.log(
      chalk.yellow(
        '\nTreating warnings as errors because process.env.CI = true.\n',
      ),
    );
    throw new Error(warnings.join('\n\n'));
  }

  return { stats };
}
