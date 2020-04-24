/*
 * Copyright 2020 Spotify AB
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

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin';
import { Paths } from './paths';
// import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles';
// import ModuleNotFoundPlugin from 'react-dev-utils/ModuleNotFoundPlugin';
// import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
// import evalSourceMapMiddleware from 'react-dev-utils/evalSourceMapMiddleware';
// import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin';

export function createConfig(paths: Paths): webpack.Configuration {
  return {
    mode: 'development',
    profile: false,
    bail: false,
    devtool: 'cheap-module-eval-source-map',
    context: paths.targetPath,
    entry: [
      `${require.resolve('webpack-dev-server/client')}?/`,
      require.resolve('webpack/hot/dev-server'),
      paths.targetDevEntry,
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
      modules: ['node_modules', paths.targetSrc],
      plugins: [
        new ModuleScopePlugin(
          [paths.targetSrc, paths.targetDev],
          [paths.targetPackageJson],
        ),
      ],
    },
    module: {
      rules: [
        {
          test: /\.(tsx?|jsx?|mjs)$/,
          enforce: 'pre',
          include: [paths.targetSrc, paths.targetDev],
          use: {
            loader: 'eslint-loader',
            options: {
              emitWarning: true,
            },
          },
        },
        {
          test: /\.(tsx?|jsx?|mjs)$/,
          include: [paths.targetSrc, paths.targetDev],
          exclude: /node_modules/,
          loader: 'ts-loader',
          options: {
            // disable type checker - handled by ForkTsCheckerWebpackPlugin
            transpileOnly: true,
          },
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.frag/, /\.xml/],
          loader: 'url-loader',
          include: paths.targetAssets,
          options: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
        {
          test: /\.ya?ml$/,
          use: 'yml-loader',
        },
        {
          include: /\.(md)$/,
          use: 'raw-loader',
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    output: {
      publicPath: '/',
      filename: 'bundle.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: paths.targetHtml,
      }),
      new ForkTsCheckerWebpackPlugin({
        tsconfig: paths.targetTsConfig,
        eslint: true,
        eslintOptions: {
          parserOptions: {
            project: paths.targetTsConfig,
            tsconfigRootDir: paths.targetPath,
          },
        },
        reportFiles: ['**', '!**/__tests__/**', '!**/?(*.)(spec|test).*'],
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
  };
}
