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

import { OptionValues } from 'commander';

import { findRoleFromCommand } from '../../lib/role';
import { startFrontend } from './startFrontend';

/**
 * This version of the "package start" command is used to start the RHDH
 * frontend in packages/app.  It is simplified from the "@backstage/cli package
 * start" command to remove support for starting the backend package.
 */
export async function command(opts: OptionValues): Promise<void> {
  const role = await findRoleFromCommand(opts);

  const options = {
    configPaths: opts.config as string[],
    checksEnabled: Boolean(opts.check),
    inspectEnabled: Boolean(opts.inspect),
    inspectBrkEnabled: Boolean(opts.inspectBrk),
  };

  switch (role) {
    case 'frontend':
      return startFrontend({
        ...options,
        entry: 'src/index',
        verifyVersions: true,
      });
    case 'web-library':
    case 'frontend-plugin':
    case 'frontend-plugin-module':
      return startFrontend({ entry: 'dev/index', ...options });
    default:
      throw new Error(
        `Start command is not supported for package role '${role}'`,
      );
  }
}
