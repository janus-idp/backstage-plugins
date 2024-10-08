/*
 * Copyright 2024 The Backstage Authors
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
import { ConfigReader } from '@backstage/config';
import { loadConfig } from '@backstage/config-loader';

import chalk from 'chalk';
import { OptionValues } from 'commander';
import * as fs from 'fs-extra';

import path from 'path';

import { paths } from '../../lib/paths';
import { Task } from '../../lib/tasks';

export async function applyDevOptions(
  opts: OptionValues,
  pkgName: string,
  role: PackageRoleInfo,
  target: string,
) {
  if (opts.dev) {
    if (role.platform === 'node') {
      await fs.ensureSymlink(
        paths.resolveTarget('src'),
        path.resolve(target, 'src'),
        'dir',
      );
    }

    let dynamicPluginsRootPath = opts.dynamicPluginsRoot as string | undefined;
    let shouldSymlink = false;
    if (!dynamicPluginsRootPath) {
      shouldSymlink = true;
      const appConfigs = await loadConfig({
        configRoot: paths.targetRoot,
        configTargets: [],
      });
      const fullConfig = ConfigReader.fromConfigs(appConfigs.appConfigs);

      const dynamicPlugins = fullConfig.getOptional('dynamicPlugins');
      if (
        typeof dynamicPlugins === 'object' &&
        dynamicPlugins !== null &&
        'rootDirectory' in dynamicPlugins &&
        typeof dynamicPlugins.rootDirectory === 'string'
      ) {
        dynamicPluginsRootPath = path.isAbsolute(dynamicPlugins.rootDirectory)
          ? dynamicPlugins.rootDirectory
          : paths.resolveTargetRoot(dynamicPlugins.rootDirectory);
      } else {
        throw new Error(
          `${chalk.cyan(
            'dynamicPlugins.rootDirectory',
          )} should be configured in the app config in order to use the ${chalk.cyan(
            '--dev',
          )} option`,
        );
      }
    }
    const destFolderPath = path.resolve(
      dynamicPluginsRootPath,
      pkgName.replace(/^@/, '').replace(/\//, '-') +
        (role.platform === 'node' ? '-dynamic' : ''),
    );
    if (shouldSymlink) {
      Task.log(
        `Linking to the dynamic plugin folder in the dynamic plugins root: ${chalk.cyan(
          path.dirname(destFolderPath),
        )}`,
      );
      fs.rmSync(destFolderPath, { force: true, recursive: true });
      await fs.ensureSymlink(target, destFolderPath, 'dir');
    } else {
      Task.log(
        `Copying the dynamic plugin folder to the dynamic plugins root:  ${chalk.cyan(
          path.dirname(destFolderPath),
        )}`,
      );

      if (!fs.existsSync(dynamicPluginsRootPath)) {
        await fs.mkdirs(dynamicPluginsRootPath);
        await fs.writeFile(
          path.resolve(dynamicPluginsRootPath, '.gitignore'),
          '*',
        );
      }
      fs.rmSync(destFolderPath, { force: true, recursive: true });
      fs.cpSync(target, destFolderPath, { recursive: true });
    }
  }
}
