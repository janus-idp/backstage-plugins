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

import { OptionValues } from 'commander';
import fs from 'fs-extra';

import { paths } from '../../lib/paths';
import { backend } from './backend';
import { frontend } from './frontend';

export async function command(opts: OptionValues): Promise<void> {
  const rawPkg = await fs.readJson(paths.resolveTarget('package.json'));
  const role = PackageRoles.getRoleFromPackage(rawPkg);
  if (!role) {
    throw new Error(`Target package must have 'backstage.role' set`);
  }

  const roleInfo = PackageRoles.getRoleInfo(role);

  if (role === 'backend-plugin' || role === 'backend-plugin-module') {
    return backend(roleInfo, opts);
  }

  if (role === 'frontend-plugin') {
    return frontend(roleInfo, opts);
  }

  throw new Error(
    'Only packages with the "backend-plugin", "backend-plugin-module" or "frontend-plugin" roles can be exported as dynamic backend plugins',
  );
}
