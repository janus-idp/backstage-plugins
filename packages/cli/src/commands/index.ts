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

/**
 * A subset of commands as compared to @backstage/cli that focuses on what
 * is needed to support dynamic plugins
 */
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
      '--allow-native-package [package-name...]',
      'Optional list of native packages names that can be included in the exported plugin',
    )
    .option(
      '--suppress-native-package [package-name...]',
      'Optional list of native package names to be excluded from the exported plugin',
    )
    .option(
      '--ignore-version-check [packageName...]',
      'Optional list of package names to ignore when doing semver dependency checks',
    )
    .option(
      '--no-install',
      'Do not run `yarn install` to fill the dynamic plugin `node_modules` folder (backend plugin only).',
    )
    .option(
      '--no-build',
      'Do not run `yarn build` on the main and embedded packages before exporting (backend plugin only).',
    )
    .option(
      '--clean',
      'Remove the dynamic plugin output before exporting again.',
    )
    .option(
      '--dev',
      'Allow testing/debugging a dynamic plugin locally. This creates a link from the dynamic plugin content to the plugin package `src` folder, to enable the use of source maps (backend plugin only). This also installs the dynamic plugin content (symlink) into the dynamic plugins root folder configured in the app config (or copies the plugin content to the location explicitely provided by the `--dynamic-plugins-root` argument).',
    )
    .option(
      '--dynamic-plugins-root <dynamic-plugins-root>',
      'Provides the dynamic plugins root folder when the dynamic plugins content should be copied when using the `--dev` argument.',
    )
    .option(
      '--embed-as-dependencies',
      'Include embedded packages as private dependencies of backend plugins. When value is `false` (using `--no-embed-as-dependencies`), source code of embedded plugins is merged with the generated code, so that the embedded plugin packages are completly erased (only available for legacy reasons: use with care).',
      true,
    )
    .option('--no-embed-as-dependencies', undefined, false)
    .option(
      '--in-place',
      'Adds the frontend dynamic plugin assets to the `dist-scalprum` folder of the original plugin package, instead of producing the assets in a distinct package located in the `dist-dynamic` sub-folder, as for backend plugins.',
      false,
    )
    .option('--no-in-place', undefined, true)
    .option(
      '--scalprum-config <file>',
      'Allows retrieving scalprum configuration from an external JSON file, instead of using a `scalprum` field of the `package.json`. Frontend plugins only.',
    )
    .option(
      '--track-dynamic-manifest-and-lock-file',
      'Adds the `package.json` and `yarn.lock` files, generated in the `dist-dynamic` folder of backend plugins, to source control. By default the whole `dist-dynamic` folder id git-ignored.',
      false,
    )
    .action(lazy(() => import('./export-dynamic-plugin').then(m => m.command)));

  command
    .command('package-dynamic-plugins')
    .description(
      'Package up exported dynamic plugins as container image for deployment',
    )
    .option(
      '--force-export',
      'Regenerate the dist-dynamic folder for each plugin even if it already exists',
    )
    .option(
      '--preserve-temp-dir',
      'Leave the temporary staging directory on the filesystem instead of deleting it',
    )
    .option(
      '--export-to <directory>',
      'Export the plugins to the specified directory, skips building the container image',
    )
    .option(
      '-t, --tag <tag>',
      'Tag name to use when building the plugin registry image.  Required if "--export-to" is not specified',
    )
    .option(
      '--use-docker',
      'By defult, the command uses podman to build the container image. Use this flag to use docker instead.',
      false,
    )
    .action(
      lazy(() => import('./package-dynamic-plugins').then(m => m.command)),
    );

  command
    .command('schema')
    .description('Print configuration schema for a package')
    .action(lazy(() => import('./schema').then(m => m.default)));

  command
    .command('metadata')
    .description('Add metadata to a package.json file')
    .option(
      '--dir <path/to/folder>',
      'Folder in which to make changes to package.json, if not the current directory',
      './',
    )
    .option('--author <author>', 'Set author', 'Red Hat')
    .option('--license <license>', 'Set license', 'Apache-2.0')
    .option('--homepage <homepage>', 'Set homepage', 'https://red.ht/rhdh')
    .option(
      '--bugs <bugs>',
      'Set issue tracker URL',
      'https://github.com/janus-idp/backstage-plugins/issues',
    )
    .option(
      '--keywords <unique,keywords,to,add>',
      'Add or replace keywords; there can be only one `support:` or `lifecycle:` value,\n                                     ' +
        'but unlimited other keywords can be added. To remove values, manually edit package.json\n\n                                     ' +
        'Valid values for support: alpha, beta, tech-preview, or production.\n                                     ' +
        'Valid values for lifecycle: active, maintenance, deprecated, inactive, retired.\n                                    ',
      'backstage,plugin,support:production,lifecycle:active',
    )
    .action(lazy(() => import('./metadata').then(m => m.command)));
}

export function registerCommands(program: Command) {
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
