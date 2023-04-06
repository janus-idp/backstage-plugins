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

import fs from 'fs-extra';
import { resolve as resolvePath, posix as posixPath } from 'path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import webpack, { ProvidePlugin } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { isChildPath } from '@backstage/cli-common';
import { getPackages } from '@manypkg/get-packages';
import { optimization } from './optimization';
import { Config } from '@backstage/config';
import { BundlingPaths } from './paths';
import { transforms } from './transforms';
import { LinkedPackageResolvePlugin } from './LinkedPackageResolvePlugin';
import { BundlingOptions, BackendBundlingOptions } from './types';
import { version } from '../../lib/version';
import { paths as cliPaths } from '../../lib/paths';
import { BackstagePackage } from '@backstage/cli-node';
import { runPlain } from '../run';
import ESLintPlugin from 'eslint-webpack-plugin';
import pickBy from 'lodash/pickBy';
import yn from 'yn';
import { readEntryPoints } from '../entryPoints';

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
    new webpack.EnvironmentPlugin({
      APP_CONFIG: options.frontendAppConfigs,
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
      'process.env.BUILD_INFO': JSON.stringify(buildInfo),
    }),
  );

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
    mode: isDev ? 'development' : 'production',
    profile: false,
    optimization: optimization(options),
    bail: false,
    performance: {
      hints: false, // we check the gzip size instead
    },
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
    context: paths.targetPath,
    entry: [paths.targetEntry],
    resolve: {
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

export async function createBackendConfig(
  paths: BundlingPaths,
  options: BackendBundlingOptions,
): Promise<webpack.Configuration> {
  const { checksEnabled, isDev } = options;

  // Find all local monorepo packages and their node_modules, and mark them as external.
  const { packages } = await getPackages(cliPaths.targetDir);
  const localPackageEntryPoints = packages.flatMap(p => {
    const entryPoints = readEntryPoints((p as BackstagePackage).packageJson);
    return entryPoints.map(e => posixPath.join(p.packageJson.name, e.mount));
  });
  const moduleDirs = packages.map(p => resolvePath(p.dir, 'node_modules'));
  // See frontend config
  const externalPkgs = packages.filter(p => !isChildPath(paths.root, p.dir));

  const { loaders } = transforms({ ...options, isBackend: true });

  const runScriptNodeArgs = new Array<string>();
  if (options.inspectEnabled) {
    runScriptNodeArgs.push('--inspect');
  } else if (options.inspectBrkEnabled) {
    runScriptNodeArgs.push('--inspect-brk');
  }

  return {
    mode: isDev ? 'development' : 'production',
    profile: false,
    ...(isDev
      ? {
          watch: true,
          watchOptions: {
            ignored: /node_modules\/(?!\@backstage)/,
          },
        }
      : {}),
    externals: [
      nodeExternalsWithResolve({
        modulesDir: paths.rootNodeModules,
        additionalModuleDirs: moduleDirs,
        allowlist: ['webpack/hot/poll?100', ...localPackageEntryPoints],
      }),
    ],
    target: 'node' as const,
    node: {
      /* eslint-disable-next-line no-restricted-syntax */
      __dirname: true,
      __filename: true,
      global: true,
    },
    bail: false,
    performance: {
      hints: false, // we check the gzip size instead
    },
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
    context: paths.targetPath,
    entry: [
      'webpack/hot/poll?100',
      paths.targetRunFile ? paths.targetRunFile : paths.targetEntry,
    ],
    resolve: {
      extensions: ['.ts', '.mjs', '.js', '.json'],
      mainFields: ['main'],
      modules: [paths.rootNodeModules, ...moduleDirs],
      plugins: [
        new LinkedPackageResolvePlugin(paths.rootNodeModules, externalPkgs),
        new ModuleScopePlugin(
          [paths.targetSrc, paths.targetDev],
          [paths.targetPackageJson],
        ),
      ],
    },
    module: {
      rules: loaders,
    },
    output: {
      path: paths.targetDist,
      filename: isDev ? '[name].js' : '[name].[hash:8].js',
      chunkFilename: isDev
        ? '[name].chunk.js'
        : '[name].[chunkhash:8].chunk.js',
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
    plugins: [
      new RunScriptWebpackPlugin({
        name: 'main.js',
        nodeArgs: runScriptNodeArgs.length > 0 ? runScriptNodeArgs : undefined,
        args: process.argv.slice(3), // drop `node backstage-cli backend:dev`
      }),
      new webpack.HotModuleReplacementPlugin(),
      ...(checksEnabled
        ? [
            new ForkTsCheckerWebpackPlugin({
              typescript: { configFile: paths.targetTsConfig },
            }),
            new ESLintPlugin({
              files: ['**/*.(ts|tsx|mts|cts|js|jsx|mjs|cjs)'],
            }),
          ]
        : []),
    ],
  };
}

// This makes the module resolution happen from the context of each non-external module, rather
// than the main entrypoint. This fixes a bug where dependencies would be resolved from the backend
// package rather than each individual backend package and plugin.
//
// TODO(Rugvip): Feature suggestion/contribute this to webpack-externals
function nodeExternalsWithResolve(
  options: Parameters<typeof nodeExternals>[0],
) {
  let currentContext: string;
  const externals = nodeExternals({
    ...options,
    importType(request) {
      const resolved = require.resolve(request, {
        paths: [currentContext],
      });
      return `commonjs ${resolved}`;
    },
  });

  return (
    { context, request }: { context?: string; request?: string },
    callback: any,
  ) => {
    currentContext = context!;
    return externals(context, request, callback);
  };
}
