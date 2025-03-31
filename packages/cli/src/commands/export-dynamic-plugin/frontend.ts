/*
 * Copyright 2023 The Backstage Authors
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

import { PackageRoleInfo } from '@backstage/cli-node';

import { getPackages } from '@manypkg/get-packages';
import chalk from 'chalk';
import { OptionValues } from 'commander';
import fs from 'fs-extra';

import path from 'path';

import { buildScalprumPlugin } from '../../lib/builder/buildScalprumPlugin';
import { productionPack } from '../../lib/packager/productionPack';
import { paths } from '../../lib/paths';
import { Task } from '../../lib/tasks';
import { customizeForDynamicUse } from './backend';

export async function frontend(
  _: PackageRoleInfo,
  opts: OptionValues,
): Promise<string> {
  const {
    name,
    version,
    scalprum: scalprumInline,
    files,
  } = await fs.readJson(paths.resolveTarget('package.json'));

  let scalprum: any = undefined;

  if (opts.scalprumConfig) {
    const scalprumConfigFile = paths.resolveTarget(opts.scalprumConfig);
    Task.log(
      `Using external scalprum config file: ${chalk.cyan(scalprumConfigFile)}`,
    );
    scalprum = await fs.readJson(scalprumConfigFile);
  } else if (scalprumInline) {
    Task.log(`Using scalprum config inlined in the 'package.json'`);
    scalprum = scalprumInline;
  } else {
    let scalprumName;
    if (name.includes('/')) {
      const fragments = name.split('/');
      scalprumName = `${fragments[0].replace('@', '')}.${fragments[1]}`;
    } else {
      scalprumName = name;
    }
    scalprum = {
      name: scalprumName,
      exposedModules: {
        PluginRoot: './src/index.ts',
      },
    };
    Task.log(`No scalprum config. Using default dynamic UI configuration:`);
    Task.log(chalk.cyan(JSON.stringify(scalprum, null, 2)));
    Task.log(
      `If you wish to change the defaults, add "scalprum" configuration to plugin "package.json" file, or use the '--scalprum-config' option to specify an external config.`,
    );
  }

  const distDynamicRelativePath = 'dist-dynamic';
  const target = opts.inPlace
    ? path.resolve(paths.targetDir)
    : path.resolve(paths.targetDir, distDynamicRelativePath);

  if (!opts.inPlace) {
    Task.log(
      `Packing main package to ${chalk.cyan(
        path.join(distDynamicRelativePath, 'package.json'),
      )}`,
    );

    if (opts.clean) {
      await fs.remove(target);
    }

    await fs.mkdirs(target);
    await fs.writeFile(
      path.join(target, '.gitignore'),
      `
*
`,
    );

    await productionPack({
      packageDir: paths.targetDir,
      targetDir: target,
    });

    Task.log(
      `Customizing main package in ${chalk.cyan(
        path.join(distDynamicRelativePath, 'package.json'),
      )} for dynamic loading`,
    );
    if (files && Array.isArray(files) && !files.includes('dist-scalprum')) {
      files.push('dist-scalprum');
    }
    const monoRepoPackages = await getPackages(paths.targetDir);
    await customizeForDynamicUse({
      embedded: [],
      isYarnV1: false,
      monoRepoPackages,
      overridding: {
        name: `${name}-dynamic`,
        // We remove scripts, because they do not make sense for this derived package.
        // They even bring errors, especially the pre-pack and post-pack ones:
        // we want to be able to use npm pack on this derived package to distribute it as a dynamic plugin,
        // and obviously this should not trigger the backstage pre-pack or post-pack actions
        // which are related to the packaging of the original static package.
        scripts: {},
        files,
      },
    })(path.resolve(target, 'package.json'));
  }

  const resolvedScalprumDistPath = path.join(target, 'dist-scalprum');

  Task.log(
    `Generating dynamic frontend plugin assets in ${chalk.cyan(
      resolvedScalprumDistPath,
    )}`,
  );

  await fs.remove(resolvedScalprumDistPath);

  await buildScalprumPlugin({
    writeStats: false,
    configPaths: [],
    targetDir: paths.targetDir,
    pluginMetadata: {
      ...scalprum,
      version,
    },
    resolvedScalprumDistPath,
  });

  return target;
}
