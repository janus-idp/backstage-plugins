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
import { Command } from 'commander';
import { buildBundle } from '../../lib/bundler';
import { parseParallel, PARALLEL_ENV_VAR } from '../../lib/parallel';
import { loadCliConfig } from '../../lib/config';
import { paths } from '../../lib/paths';
import chalk from 'chalk';

export default async (cmd: Command) => {
  if (cmd.lax) {
    console.warn(
      chalk.yellow(
        `[DEPRECATED] - The --lax option is deprecated and will be removed in the future. Please open an issue towards https://github.com/backstage/backstage that describes your use-case if you need the flag to stay around.`,
      ),
    );
  }

  const { name } = await fs.readJson(paths.resolveTarget('package.json'));
  await buildBundle({
    entry: 'src/index',
    parallel: parseParallel(process.env[PARALLEL_ENV_VAR]),
    statsJsonEnabled: cmd.stats,
    ...(await loadCliConfig({
      args: cmd.config,
      fromPackage: name,
      mockEnv: cmd.lax,
    })),
  });
};
