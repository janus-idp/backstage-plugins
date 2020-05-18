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

import fs from 'fs-extra';
import { relative as relativePath } from 'path';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import esbuild from 'rollup-plugin-esbuild';
import imageFiles from 'rollup-plugin-image-files';
import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import { RollupOptions } from 'rollup';

import { paths } from '../paths';

export const makeConfigs = async (): Promise<RollupOptions[]> => {
  const typesInput = paths.resolveTargetRoot(
    'dist',
    relativePath(paths.targetRoot, paths.targetDir),
    'src/index.d.ts',
  );

  const declarationsExist = await fs.pathExists(typesInput);
  if (!declarationsExist) {
    const path = relativePath(paths.targetDir, typesInput);
    throw new Error(
      `No declaration files found at ${path}, be sure to run tsc to generate .d.ts files before packaging`,
    );
  }

  return [
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.esm.js',
        format: 'module',
      },
      plugins: [
        peerDepsExternal({
          includeDependencies: true,
        }),
        resolve({
          mainFields: ['browser', 'module', 'main'],
        }),
        commonjs({
          include: ['node_modules/**', '../../node_modules/**'],
          exclude: ['**/*.stories.*', '**/*.test.*'],
        }),
        postcss(),
        imageFiles(),
        json(),
        esbuild({
          target: 'es2019',
        }),
      ],
    },
    {
      input: typesInput,
      output: {
        file: 'dist/index.d.ts',
        format: 'es',
      },
      plugins: [dts()],
    },
  ];
};
