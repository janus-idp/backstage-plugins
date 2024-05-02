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

import { PackageRoles } from '@backstage/cli-node';

import chalk from 'chalk';
import { OptionValues } from 'commander';
import fs from 'fs-extra';

import path from 'path';

import { paths } from '../../lib/paths';
import { getConfigSchema } from '../../lib/schema/collect';
import { Task } from '../../lib/tasks';
import { backend as backendEmbedAsCode } from './backend-embed-as-code';
import { backend as backendEmbedAsDependencies } from './backend-embed-as-dependencies';
import { applyDevOptions } from './dev';
import { frontend } from './frontend';

const saveSchema = async (packageName: string, destination: string) => {
  const configSchema = await getConfigSchema(packageName);
  await fs.writeJson(paths.resolveTarget(destination), configSchema, {
    encoding: 'utf8',
    spaces: 2,
  });
};

export async function command(opts: OptionValues): Promise<void> {
  const rawPkg = await fs.readJson(paths.resolveTarget('package.json'));
  const role = PackageRoles.getRoleFromPackage(rawPkg);
  if (!role) {
    throw new Error(`Target package must have 'backstage.role' set`);
  }

  let targetPath: string;
  const roleInfo = PackageRoles.getRoleInfo(role);
  let configSchemaPath: string;

  if (role === 'backend-plugin' || role === 'backend-plugin-module') {
    if (opts.embedAsDependencies) {
      targetPath = await backendEmbedAsDependencies(opts);
    } else {
      targetPath = await backendEmbedAsCode(roleInfo, opts);
    }
    configSchemaPath = path.join(targetPath, 'dist/configSchema.json');
  } else if (role === 'frontend-plugin' || role === 'frontend-plugin-module') {
    targetPath = await frontend(roleInfo, opts);
    configSchemaPath = path.join(targetPath, 'dist-scalprum/configSchema.json');
  } else {
    throw new Error(
      'Only packages with the "backend-plugin", "backend-plugin-module" or "frontend-plugin" roles can be exported as dynamic backend plugins',
    );
  }

  Task.log(
    `Saving self-contained config schema in ${chalk.cyan(configSchemaPath)}`,
  );
  await saveSchema(rawPkg.name, configSchemaPath);

  await applyDevOptions(opts, rawPkg.name, roleInfo, targetPath);
}
