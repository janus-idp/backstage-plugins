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

import { assertError } from '@backstage/errors';

import { Command, InvalidArgumentError } from 'commander';

import { exitWithError } from '../lib/errors';

const configOption = [
  '--config <path>',
  'Config files to load instead of app-config.yaml',
  (opt: string, opts: string[]) => (opts ? [...opts, opt] : [opt]),
  Array<string>(),
] as const;

export function registerScriptCommand(program: Command) {
  const command = program
    .command('package [command]')
    .description('Lifecycle scripts for individual packages');

  command
    .command('start')
    .description('Start a package for local development')
    .option(...configOption)
    .option('--role <name>', 'Run the command with an explicit package role')
    .option('--check', 'Enable type checking and linting if available')
    .option('--inspect', 'Enable debugger in Node.js environments')
    .option(
      '--inspect-brk',
      'Enable debugger in Node.js environments, breaking before code starts',
    )
    .action(lazy(() => import('./start').then(m => m.command)));

  command
    .command('build')
    .description('Build a package for production deployment or publishing')
    .option('--role <name>', 'Run the command with an explicit package role')
    .option(
      '--minify',
      'Minify the generated code. Does not apply to app or backend packages.',
    )
    .option(
      '--experimental-type-build',
      'Enable experimental type build. Does not apply to app or backend packages. [DEPRECATED]',
    )
    .option(
      '--skip-build-dependencies',
      'Skip the automatic building of local dependencies. Applies to backend packages only.',
    )
    .option(
      '--stats',
      'If bundle stats are available, write them to the output directory. Applies to app packages only.',
    )
    .option(
      '--config <path>',
      'Config files to load instead of app-config.yaml. Applies to app packages only.',
      (opt: string, opts: string[]) => (opts ? [...opts, opt] : [opt]),
      Array<string>(),
    )
    .action(lazy(() => import('./build').then(m => m.command)));

  command
    .command('export-dynamic-plugin')
    .description(
      'Build and export a plugin package to be loaded as a dynamic plugin. The repackaged dynamic plugin is exported inside a ./dist-dynamic sub-folder.',
    )
    .option('--minify', 'Minify the generated code (backend plugin only).')
    .option(
      '--embed-package [package-name...]',
      'Optional list of packages that should be embedded inside the generated code of a backend dynamic plugin, removed from the plugin dependencies, while their direct dependencies will be hoisted to the dynamic plugin dependencies (backend plugin only).',
    )
    .option(
      '--shared-package [package-name...]',
      'Optional list of packages that should be considered shared by all dynamic plugins, and will be moved to peer dependencies of the dynamic plugin. The `@backstage` packages are by default considered shared dependencies.',
    )
    .option(
      '--override-interop <mode:package-name,package-name...>',
      'Optional list of packages for which the CommonJS Rollup output interop mode should be overridden to `mode` when building the dynamic plugin assets (backend plugin only).',
      (value, previous) => {
        const [key, val] = value.split(':');
        if (!['auto', 'esModule', 'default', 'defaultOnly'].includes(key)) {
          throw new InvalidArgumentError(
            `Invalid interop mode '${key}'. Possible values are: auto, esModule, default, defaultOnly (see https://rollupjs.org/configuration-options/#output-interop).`,
          );
        }
        return { ...previous, [key]: val?.split(',') || [] };
      },
      {},
    )
    .option(
      '--no-install',
      'Do not run `yarn install` to fill the dynamic plugin `node_modules` folder (backend plugin only).',
    )
    .option(
      '--clean',
      'Remove the dynamic plugin output before exporting again.',
    )
    .option(
      '--dev',
      'Allow testing/debugging a backend plugin dynamic loading locally. This installs the dynamic plugin content (symlink) into the dynamic plugins root folder configured in the app config. This also creates a link from the dynamic plugin content to the plugin package `src` folder, to enable the use of source maps (backend plugin only).',
    )
    .action(lazy(() => import('./export-dynamic-plugin').then(m => m.command)));

  command
    .command('schema')
    .description('Print configuration schema for a package')
    .action(lazy(() => import('./schema').then(m => m.default)));
}

export function registerCommands(program: Command) {
  program
    .command('new')
    .storeOptionsAsProperties(false)
    .description(
      'Open up an interactive guide to creating new things in your app',
    )
    .option(
      '--select <name>',
      'Select the thing you want to be creating upfront',
    )
    .option(
      '--option <name>=<value>',
      'Pre-fill options for the creation process',
      (opt, arr: string[]) => [...arr, opt],
      [],
    )
    .option('--scope <scope>', 'The scope to use for new packages')
    .option(
      '--npm-registry <URL>',
      'The package registry to use for new packages',
    )
    .option(
      '--baseVersion <version>',
      'The version to use for any new packages (default: 0.1.0)',
    )
    .option('--no-private', 'Do not mark new packages as private')
    .action(lazy(() => import('./new/new').then(m => m.default)));

  registerScriptCommand(program);
}

// Wraps an action function so that it always exits and handles errors
function lazy(
  getActionFunc: () => Promise<(...args: any[]) => Promise<void>>,
): (...args: any[]) => Promise<never> {
  return async (...args: any[]) => {
    try {
      const actionFunc = await getActionFunc();
      await actionFunc(...args);

      process.exit(0);
    } catch (error) {
      assertError(error);
      exitWithError(error);
    }
  };
}
