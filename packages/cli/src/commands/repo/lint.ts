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

import chalk from 'chalk';
import { Command } from 'commander';
import { relative as relativePath } from 'path';
import { PackageGraph } from '../../lib/monorepo';
import { runWorkerQueueThreads } from '../../lib/parallel';
import { paths } from '../../lib/paths';

export async function command(cmd: Command): Promise<void> {
  const packages = await PackageGraph.listTargetPackages();

  // This formatter uses the cwd to format file paths, so let's have that happen from the root instead
  if (cmd.format === 'eslint-formatter-friendly') {
    process.chdir(paths.targetRoot);
  }

  // Make sure lint output is colored unless the user explicitly disabled it
  if (!process.env.FORCE_COLOR) {
    process.env.FORCE_COLOR = '1';
  }

  const resultsList = await runWorkerQueueThreads({
    items: packages.map(pkg => ({
      fullDir: pkg.dir,
      relativeDir: relativePath(paths.targetRoot, pkg.dir),
    })),
    workerData: {
      fix: Boolean(cmd.fix),
      format: cmd.format as string | undefined,
    },
    workerFactory: async ({ fix, format }) => {
      const { ESLint } = require('eslint');

      return async ({
        fullDir,
        relativeDir,
      }): Promise<{ relativeDir: string; resultText: string }> => {
        // Bit of a hack to make file resolutions happen from the correct directory
        // since some lint rules don't respect the cwd of ESLint
        process.cwd = () => fullDir;

        const eslint = new ESLint({
          cwd: fullDir,
          fix,
          extensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'],
        });
        const formatter = await eslint.loadFormatter(format);

        const results = await eslint.lintFiles(['.']);

        const count = String(results.length).padStart(3);
        console.log(`Checked ${count} files in ${relativeDir}`);

        if (fix) {
          await ESLint.outputFixes(results);
        }

        const resultText = formatter.format(results);

        return { relativeDir, resultText };
      };
    },
  });

  let failed = false;
  for (const { relativeDir, resultText } of resultsList) {
    if (resultText) {
      console.log();
      console.log(chalk.red(`Lint failed in ${relativeDir}:`));
      console.log(resultText.trimLeft());

      failed = true;
    }
  }

  if (failed) {
    process.exit(1);
  }
}
