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

import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin';

import { isChildPath } from '@backstage/cli-common';
import { Config } from '@backstage/config';

import { getPackages } from '@manypkg/get-packages';
import ESLintPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import fs from 'fs-extra';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import pickBy from 'lodash/pickBy';
import webpack, { container, ProvidePlugin } from 'webpack';
import yn from 'yn';

import { join as joinPath, resolve as resolvePath } from 'path';

import { paths as cliPaths } from '../../lib/paths';
import { version } from '../../lib/version';
import { runPlain } from '../run';
import { LinkedPackageResolvePlugin } from './LinkedPackageResolvePlugin';
import { optimization } from './optimization';
import { BundlingPaths } from './paths';
import { sharedModules } from './scalprumConfig';
import { transforms } from './transforms';
import { BundlingOptions } from './types';

const { ModuleFederationPlugin } = container;

const scalprumPlugin = new ModuleFederationPlugin({
  name: 'backstageHost',
  filename: 'backstageHost.[fullhash].js',
  shared: [sharedModules],
});

const BUILD_CACHE_ENV_VAR = 'BACKSTAGE_CLI_EXPERIMENTAL_BUILD_CACHE';

export function resolveBaseUrl(config: Config): URL {
  const baseUrl = config.getString('app.baseUrl');
  try {
    return new URL(baseUrl);
  } catch (error) {
    throw new Error(`Invalid app.baseUrl, ${error}`);
  }
}

async function readBuildInfo() {
  const timestamp = Date.now();

  let commit = 'unknown';
  try {
    commit = await runPlain('git', 'rev-parse', 'HEAD');
  } catch (error) {
    console.warn(`WARNING: Failed to read git commit, ${error}`);
  }

  let gitVersion = 'unknown';
  try {
    gitVersion = await runPlain('git', 'describe', '--always');
  } catch (error) {
    console.warn(`WARNING: Failed to describe git version, ${error}`);
  }

  const { version: packageVersion } = await fs.readJson(
    cliPaths.resolveTarget('package.json'),
  );

  return {
    cliVersion: version,
    gitVersion,
    packageVersion,
    timestamp,
    commit,
  };
}

export async function createConfig(
  paths: BundlingPaths,
  options: BundlingOptions,
): Promise<webpack.Configuration> {
  const { checksEnabled, isDev, frontendConfig } = options;

  const { plugins, loaders } = transforms(options);
  // Any package that is part of the monorepo but outside the monorepo root dir need
  // separate resolution logic.
  const { packages } = await getPackages(cliPaths.targetDir);
  const externalPkgs = packages.filter(p => !isChildPath(paths.root, p.dir));

  const baseUrl = frontendConfig.getString('app.baseUrl');
  const validBaseUrl = new URL(baseUrl);
  const publicPath = validBaseUrl.pathname.replace(/\/$/, '');
  if (checksEnabled) {
    plugins.push(
      new ForkTsCheckerWebpackPlugin({
        typescript: { configFile: paths.targetTsConfig, memoryLimit: 4096 },
      }),
      new ESLintPlugin({
        context: paths.targetPath,
        files: ['**/*.(ts|tsx|mts|cts|js|jsx|mjs|cjs)'],
      }),
    );
  }

  // TODO(blam): process is no longer auto polyfilled by webpack in v5.
  // we use the provide plugin to provide this polyfill, but lets look
  // to remove this eventually!
  plugins.push(
    new ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  plugins.push(
    new HtmlWebpackPlugin({
      template: paths.targetHtml,
      templateParameters: {
        publicPath,
        config: frontendConfig,
      },
    }),
  );

  const buildInfo = await readBuildInfo();
  plugins.push(
    new webpack.DefinePlugin({
      'process.env.HAS_REACT_DOM_CLIENT': false,
      'process.env.BUILD_INFO': JSON.stringify(buildInfo),
      'process.env.APP_CONFIG': webpack.DefinePlugin.runtimeValue(
        () => JSON.stringify(options.getFrontendAppConfigs()),
        true,
      ),
    }),
  );

  plugins.push(scalprumPlugin);

  // These files are required by the transpiled code when using React Refresh.
  // They need to be excluded to the module scope plugin which ensures that files
  // that exist in the package are required.
  const reactRefreshFiles = [
    require.resolve(
      '@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js',
    ),
    require.resolve('@pmmmwh/react-refresh-webpack-plugin/overlay/index.js'),
    require.resolve('react-refresh'),
  ];

  const withCache = yn(process.env[BUILD_CACHE_ENV_VAR], { default: false });

  return {
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
      cacheDirectory: joinPath(process.cwd(), '.webpack-cache'),
    },
    mode: isDev ? 'development' : 'production',
    profile: false,
    optimization: optimization(options),
    bail: false,
    performance: {
      hints: false, // we check the gzip size instead
    },
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
    context: paths.targetPath,
    entry: [...(options.additionalEntryPoints ?? []), paths.targetEntry],
    resolve: {
      alias: {
        '@backstage/frontend-app-api/src': joinPath(
          process.cwd(),
          'src',
          'overrides',
          '@backstage',
          'frontend-app-api',
          'src',
        ),
      },
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json', '.wasm'],
      mainFields: ['browser', 'module', 'main'],
      fallback: {
        ...pickBy(require('node-libs-browser')),
        module: false,
        dgram: false,
        dns: false,
        fs: false,
        http2: false,
        net: false,
        tls: false,
        child_process: false,

        /* new ignores */
        path: false,
        https: false,
        http: false,
        util: require.resolve('util/'),
      },
      plugins: [
        new LinkedPackageResolvePlugin(paths.rootNodeModules, externalPkgs),
        new ModuleScopePlugin(
          [paths.targetSrc, paths.targetDev],
          [paths.targetPackageJson, ...reactRefreshFiles],
        ),
      ],
    },
    module: {
      rules: loaders,
    },
    output: {
      path: paths.targetDist,
      publicPath: `${publicPath}/`,
      filename: isDev ? '[name].js' : 'static/[name].[fullhash:8].js',
      chunkFilename: isDev
        ? '[name].chunk.js'
        : 'static/[name].[chunkhash:8].chunk.js',
      ...(isDev
        ? {
            devtoolModuleFilenameTemplate: (info: any) =>
              `file:///${resolvePath(info.absoluteResourcePath).replace(
                /\\/g,
                '/',
              )}`,
          }
        : {}),
    },
    plugins,
    ...(withCache
      ? {
          cache: {
            type: 'filesystem',
            buildDependencies: {
              config: [__filename],
            },
          },
        }
      : {}),
  };
}
