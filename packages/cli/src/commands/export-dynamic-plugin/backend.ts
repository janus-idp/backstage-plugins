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

import { BackstagePackageJson, PackageRoleInfo } from '@backstage/cli-node';

import { getPackages } from '@manypkg/get-packages';
import { OptionValues } from 'commander';
import fs from 'fs-extra';
import { rollup } from 'rollup';
import * as semver from 'semver';

import path, { basename } from 'path';

import { Output } from '../../lib/builder';
import { makeRollupConfigs } from '../../lib/builder/config';
import { embedModules } from '../../lib/builder/embedPlugin';
import { buildPackage, formatErrorMessage } from '../../lib/builder/packager';
import { loadCliConfig } from '../../lib/config';
import { productionPack } from '../../lib/packager/productionPack';
import { paths } from '../../lib/paths';
import { Task } from '../../lib/tasks';

export async function backend(
  roleInfo: PackageRoleInfo,
  opts: OptionValues,
): Promise<void> {
  if (!fs.existsSync(paths.resolveTarget('src', 'dynamic'))) {
    throw new Error(
      `Package doesn't seem to support dynamic loading. It should have a src/dynamic folder, containing the dynamic loading entrypoints.`,
    );
  }

  const outputs = new Set<Output>();

  if (roleInfo.output.includes('cjs')) {
    outputs.add(Output.cjs);
  }
  if (roleInfo.output.includes('esm')) {
    outputs.add(Output.esm);
  }

  const pkgContent = await fs.readFile(
    paths.resolveTarget('package.json'),
    'utf8',
  );
  const pkg = JSON.parse(pkgContent) as BackstagePackageJson;
  if (pkg.bundled) {
    throw new Error(
      'Packages exported as dynamic backend plugins should not have the "bundled" field set to true',
    );
  }

  const target = path.join(paths.targetDir, 'dist-dynamic');

  if (
    !pkg.files?.includes('dist-dynamic/*.*') ||
    !pkg.files?.includes('dist-dynamic/dist/**') ||
    !pkg.files?.includes('dist-dynamic/alpha/*')
  ) {
    throw new Error(
      `Package doesn't seem to support dynamic loading: its "files" property should include the following entries: ["dist-dynamic/*.*", "dist-dynamic/dist/**", "dist-dynamic/alpha/*"].`,
    );
  }

  const mergeWithOutput: (string | RegExp)[] = [];

  const commonPackage = pkg.name.replace(/-backend$/, '-common');
  if (commonPackage !== pkg.name) {
    mergeWithOutput.push(commonPackage);
  }

  if (opts.embedPackage !== undefined) {
    for (const pkgToEmbed of opts.embedPackage as string[]) {
      if (pkg.dependencies === undefined || !(pkgToEmbed in pkg.dependencies)) {
        console.log(
          `Embeded package '${pkgToEmbed}' is not part of direct dependencies. Are you sure you want to embed it ?`,
        );
      }
      mergeWithOutput.push(pkgToEmbed);
      const relatedCommonPackage = pkgToEmbed.replace(/-backend$/, '-common');
      if (relatedCommonPackage !== pkgToEmbed) {
        mergeWithOutput.push(relatedCommonPackage);
      }
    }
  }

  const filter = {
    include: mergeWithOutput,
    exclude: mergeWithOutput.length !== 0 ? undefined : /.*/,
  };

  const stringOrRegexp = (s: string) =>
    s.startsWith('/') && s.endsWith('/') ? new RegExp(s.slice(1, -1)) : s;

  const moveToPeerDependencies = [
    /@backstage\//,
    ...((opts.sharedPackage || []) as string[])
      .filter(p => !p.startsWith('!'))
      .map(stringOrRegexp),
  ];

  const dontMoveToPeerDependencies = ((opts.sharedPackage || []) as string[])
    .filter(p => p.startsWith('!'))
    .map(p => p.slice(1))
    .map(stringOrRegexp);

  const rollupConfigs = await makeRollupConfigs({
    outputs,
    minify: Boolean(opts.minify),
    useApiExtractor: false,
  });

  if (rollupConfigs.length === 0) {
    throw new Error('Rollup config is missing');
  }

  const dependenciesToAdd: {
    [key: string]: string;
  } = {};

  const rollupConfig = rollupConfigs[0];
  rollupConfig.plugins?.push(
    embedModules({
      filter: filter,
      addDependency(embeddedModule, dependencyName, newDependencyVersion) {
        const existingDependencyVersion = dependenciesToAdd[dependencyName];
        if (existingDependencyVersion === undefined) {
          dependenciesToAdd[dependencyName] = newDependencyVersion;
          return;
        }

        if (existingDependencyVersion === newDependencyVersion) {
          return;
        }

        const existingDependencyMinVersion = semver.minVersion(
          existingDependencyVersion,
        );
        if (
          existingDependencyMinVersion &&
          semver.satisfies(existingDependencyMinVersion, newDependencyVersion)
        ) {
          console.log(
            `Several compatible versions ('${existingDependencyVersion}', '${newDependencyVersion}') of the same transitive dependency ('${dependencyName}') for embedded module ('${embeddedModule}'): keeping '${existingDependencyVersion}'`,
          );
          return;
        }

        const newDependencyMinVersion = semver.minVersion(newDependencyVersion);
        if (
          newDependencyMinVersion &&
          semver.satisfies(newDependencyMinVersion, existingDependencyVersion)
        ) {
          dependenciesToAdd[dependencyName] = newDependencyVersion;
          console.log(
            `Several compatible versions ('${existingDependencyVersion}', '${newDependencyVersion}') of the same transitive dependency ('${dependencyName}') for embedded module ('${embeddedModule}'): keeping '${newDependencyVersion}'`,
          );
          return;
        }

        throw new Error(
          `Several incompatible versions ('${existingDependencyVersion}', '${newDependencyVersion}') of the same transitive dependency ('${dependencyName}') for embedded module ('${embeddedModule}')`,
        );
      },
    }),
  );

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output.forEach(output => {
      if (output.format === 'commonjs') {
        output.interop = 'default';
      }
    });
  }

  await fs.remove(paths.resolveTarget('dist'));

  try {
    const bundle = await rollup(rollupConfig);
    if (rollupConfig.output) {
      for (const output of [rollupConfig.output].flat()) {
        await bundle.generate(output);
        await bundle.write(output);
      }
    }
  } catch (error) {
    throw new Error(formatErrorMessage(error));
  }

  if (opts.clean) {
    await fs.remove(target);
  }

  const monoRepoPackages = await getPackages(paths.targetDir);
  await productionPack({
    packageDir: '',
    targetDir: target,
    customizeManifest: (pkgToCustomize: BackstagePackageJson) => {
      function test(str: string, expr: string | RegExp): boolean {
        if (typeof expr === 'string') {
          return str === expr;
        }
        return expr.test(str);
      }

      pkgToCustomize.name = `${pkgToCustomize.name}-dynamic`;
      (pkgToCustomize as any).bundleDependencies = true;

      pkgToCustomize.files = pkgToCustomize.files?.filter(
        f => !f.startsWith('dist-dynamic/'),
      );

      for (const dep in dependenciesToAdd) {
        if (!Object.prototype.hasOwnProperty.call(dependenciesToAdd, dep)) {
          continue;
        }
        pkgToCustomize.dependencies ||= {};
        const existingVersion = pkgToCustomize.dependencies[dep];
        if (existingVersion === undefined) {
          pkgToCustomize.dependencies[dep] = dependenciesToAdd[dep];
          continue;
        }
        if (existingVersion !== dependenciesToAdd[dep]) {
          const existingMinVersion = semver.minVersion(existingVersion);

          if (
            existingMinVersion &&
            semver.satisfies(existingMinVersion, dependenciesToAdd[dep])
          ) {
            console.log(
              `The version of a dependency ('${dep}') of an embedded module differs from the main module's dependencies: '${dependenciesToAdd[dep]}', '${existingVersion}': keeping it as it is compatible`,
            );
          } else {
            throw new Error(
              `The version of a dependency ('${dep}') of an embedded module conflicts with main module dependencies: '${dependenciesToAdd[dep]}', '${existingVersion}': cannot proceed!`,
            );
          }
        }
      }
      if (pkgToCustomize.dependencies) {
        for (const monoRepoPackage of monoRepoPackages.packages) {
          if (pkgToCustomize.dependencies[monoRepoPackage.packageJson.name]) {
            pkgToCustomize.dependencies[
              monoRepoPackage.packageJson.name
            ] = `^${monoRepoPackage.packageJson.version}`;
          }
        }

        for (const dep in pkgToCustomize.dependencies) {
          if (
            !Object.prototype.hasOwnProperty.call(
              pkgToCustomize.dependencies,
              dep,
            )
          ) {
            continue;
          }

          if (mergeWithOutput.some(merge => test(dep, merge))) {
            delete pkgToCustomize.dependencies[dep];
            continue;
          }

          if (
            dontMoveToPeerDependencies.some(dontMove => test(dep, dontMove))
          ) {
            continue;
          }

          if (moveToPeerDependencies.some(move => test(dep, move))) {
            console.log(`Moving '${dep}' to peerDependencies`);

            pkgToCustomize.peerDependencies ||= {};
            pkgToCustomize.peerDependencies[dep] =
              pkgToCustomize.dependencies[dep];
            delete pkgToCustomize.dependencies[dep];
          }
        }
      }

      // We remove devDependencies here since we want the dynamic plugin derived package
      // to get only production dependencies, and no transitive dependencies, in both
      // the node_modules sub-folder and yarn.lock file in `dist-dynamic`.
      //
      // And it happens that `yarn install --production` (yarn 1) doesn't completely
      // remove devDependencies as needed.
      //
      // See https://github.com/yarnpkg/yarn/issues/6373#issuecomment-760068356
      pkgToCustomize.devDependencies = {};

      // The following lines are a workaround for the fact that the @aws-sdk/util-utf8-browser package
      // is not compatible with the NPM 9+, so that `npm pack` would not grab the Javascript files.
      // This package has been deprecated in favor of @smithy/util-utf8.
      //
      // See https://github.com/aws/aws-sdk-js-v3/issues/5305.

      const overrides = (pkgToCustomize as any).overrides || {};
      (pkgToCustomize as any).overrides = {
        ...overrides,
        '@aws-sdk/util-utf8-browser': {
          '@smithy/util-utf8': '^2.0.0',
        },
      };
      const resolutions = (pkgToCustomize as any).resolutions || {};
      (pkgToCustomize as any).resolutions = {
        ...resolutions,
        '@aws-sdk/util-utf8-browser': 'npm:@smithy/util-utf8@^2.0.0',
      };
    },
  });

  const yarnLock = path.resolve(target, 'yarn.lock');
  const yarnLockExists = fs.existsSync(yarnLock);

  if (!yarnLockExists) {
    // Create an empty yarn.lock to make it clear that the exported dynamic plugin is
    // NOT part of a workspace.
    await fs.ensureFile(yarnLock);
  }

  if (opts.install) {
    const yarnInstall = `yarn install --production${
      yarnLockExists ? ' --frozen-lockfile' : ''
    }`;

    await Task.forCommand(yarnInstall, { cwd: target, optional: false });
    await fs.remove(paths.resolveTarget('dist-dynamic', '.yarn'));
  }

  // Remove the `dist` folder of the original plugin root folder and rebuild it,
  // since it has been compiled with dynamic-specific settings.
  await fs.remove(paths.resolveTarget('dist'));
  await buildPackage({
    outputs,
    minify: Boolean(opts.minify),
  });

  if (opts.dev) {
    if (opts.dev) {
      const { fullConfig } = await loadCliConfig({ args: [] });
      const dynamicPlugins = fullConfig.getOptional('dynamicPlugins');
      if (
        typeof dynamicPlugins === 'object' &&
        dynamicPlugins !== null &&
        'rootDirectory' in dynamicPlugins &&
        typeof dynamicPlugins.rootDirectory === 'string'
      ) {
        await fs.ensureSymlink(
          paths.resolveTarget('src'),
          path.resolve(target, 'src'),
          'dir',
        );
        const dynamicPluginsRootPath = path.isAbsolute(
          dynamicPlugins.rootDirectory,
        )
          ? dynamicPlugins.rootDirectory
          : paths.resolveTargetRoot(dynamicPlugins.rootDirectory);
        await fs.ensureSymlink(
          target,
          path.resolve(dynamicPluginsRootPath, basename(paths.targetDir)),
          'dir',
        );
      } else {
        throw new Error(
          `'dynamicPlugins.rootDirectory' should be configured in the app config in order to use the --dev option.`,
        );
      }
    }
  }
}
