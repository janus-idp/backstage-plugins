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

import { paths } from '../../lib/paths';
import { findRoleFromCommand } from '../../lib/role';
import { isValidUrl } from '../../lib/urls';
import { buildFrontend } from './buildFrontend';

/**
 * A simplified build command as compared to `@backstage/cli package build`
 * that only builds frontend packages.  This command is used to build the
 * RHDH frontend app in `packages/app` as it adds the build configuration for
 * webpack module federation support via Scalprum.
 */
export async function command(opts: OptionValues): Promise<void> {
  const role = await findRoleFromCommand(opts);

  const configPaths = (opts.config as string[]).map(arg => {
    if (isValidUrl(arg)) {
      return arg;
    }
    return paths.resolveTarget(arg);
  });

  if (role === 'frontend') {
    return buildFrontend({
      targetDir: paths.targetDir,
      configPaths,
      writeStats: Boolean(opts.stats),
    });
  }

  throw new Error(
    "Package role not supported, please use 'backstage-cli' instead",
  );
}
