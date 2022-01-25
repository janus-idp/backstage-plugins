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

import { Command } from 'commander';
import { buildPackage, Output } from '../../lib/builder';
import { PackageRole, findRoleFromCommand, getRoleInfo } from '../../lib/role';

const bundledRoles: PackageRole[] = ['app', 'backend'];

export async function command(cmd: Command): Promise<void> {
  const role = await findRoleFromCommand(cmd);
  const roleInfo = getRoleInfo(role);

  if (bundledRoles.includes(role)) {
    throw new Error(
      `Build command is not supported for package role '${role}'`,
    );
  }

  const outputs = new Set<Output>();

  if (roleInfo.output.includes('cjs')) {
    outputs.add(Output.cjs);
  }
  if (roleInfo.output.includes('esm')) {
    outputs.add(Output.esm);
  }
  if (roleInfo.output.includes('types')) {
    outputs.add(Output.types);
  }

  await buildPackage({
    outputs,
    minify: Boolean(cmd.minify),
    useApiExtractor: Boolean(cmd.experimentalTypeBuild),
  });
}
