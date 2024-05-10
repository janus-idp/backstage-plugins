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
import { InteropType, rollup } from 'rollup';

import { execSync } from 'child_process';
import path from 'path';

import { Output } from '../../lib/builder';
import { makeRollupConfigs } from '../../lib/builder/config';
import { embedModules } from '../../lib/builder/embedPlugin';
import { buildPackage, formatErrorMessage } from '../../lib/builder/packager';
import { readEntryPoints } from '../../lib/entryPoints';
import { productionPack } from '../../lib/packager/productionPack';
import { paths } from '../../lib/paths';
import { Task } from '../../lib/tasks';
import {
  addToDependenciesForModule,
  addToMainDependencies,
} from './backend-utils';

export async function backend(
  roleInfo: PackageRoleInfo,
  opts: OptionValues,
): Promise<string> {
  if (!fs.existsSync(paths.resolveTarget('src', 'dynamic'))) {
    console.warn(
      `Package doesn't seem to provide dynamic loading entrypoints. You might want to add dynamic loading entrypoints in a src/dynamic folder.`,
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

  const requiredFiles = ['dist-dynamic/*.*', 'dist-dynamic/dist/**'];

  const entryPoints = readEntryPoints(pkg);
  if (entryPoints.find(e => e.mount === './alpha')) {
    requiredFiles.push('dist-dynamic/alpha/*');
  }

  if (requiredFiles.some(f => !pkg.files?.includes(f))) {
    console.warn(
      `Package doesn't seem to fully support dynamic loading: its "files" property should include the following entries: [${requiredFiles
        .map(f => `"${f}"`)
        .join(', ')}].`,
    );
  }

  const mergeWithOutput: (string | RegExp)[] = [];

  const commonPackage = pkg.name.replace(/-backend$/, '-common');
  if (commonPackage !== pkg.name) {
    mergeWithOutput.push(commonPackage);
  }
  const nodePackage = pkg.name.replace(/-backend$/, '-node');
  if (nodePackage !== pkg.name) {
    mergeWithOutput.push(nodePackage);
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
      const relatedNodePackage = pkgToEmbed.replace(/-backend$/, '-node');
      if (relatedNodePackage !== pkgToEmbed) {
        mergeWithOutput.push(relatedNodePackage);
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

  let interopForAll: InteropType | undefined = undefined;
  const interopForPackage: { [key: string]: InteropType } = {};
  for (const mode in opts.overrideInterop) {
    if (!Object.prototype.hasOwnProperty.call(opts.overrideInterop, mode)) {
      continue;
    }

    if (!opts.overrideInterop[mode]?.length) {
      interopForAll = mode as InteropType;
    }
    for (const interopPkg of opts.overrideInterop[mode]) {
      interopForPackage[interopPkg] = mode as InteropType;
    }
  }

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
      addDependency: (embeddedModule, dependencyName, newDependencyVersion) =>
        addToDependenciesForModule(
          {
            name: dependencyName,
            version: newDependencyVersion,
          },
          dependenciesToAdd,
          embeddedModule,
        ),
    }),
  );

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output.forEach(output => {
      if (output.format === 'commonjs') {
        if (interopForAll) {
          console.log(
            `Overriding Interop to '${interopForAll}' for all imports`,
          );
        }
        output.interop = (id: string | null) => {
          if (id && interopForPackage[id]) {
            console.log(
              `Overriding Interop to '${interopForPackage[id]}' for '${id}'`,
            );
            return interopForPackage[id];
          }
          return interopForAll || true; // true is the default value in Rollup.
        };
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

      // We remove scripts, because they do not make sense for this derived package.
      // They even bring errors, especially the pre-pack and post-pack ones:
      // we want to be able to use npm pack on this derived package to distribute it as a dynamic plugin,
      // and obviously this should not trigger the backstage pre-pack or post-pack actions
      // which are related to the packaging of the original static package.
      pkgToCustomize.scripts = {};

      const pkgDependencies = pkgToCustomize.dependencies || {};
      addToMainDependencies(dependenciesToAdd, pkgDependencies);
      if (Object.keys(pkgDependencies).length > 0) {
        pkgToCustomize.dependencies = pkgDependencies;
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
        '@aws-sdk/util-utf8-browser': {
          '@smithy/util-utf8': '^2.0.0',
        },
        ...overrides,
      };
      const resolutions = (pkgToCustomize as any).resolutions || {};
      (pkgToCustomize as any).resolutions = {
        '@aws-sdk/util-utf8-browser': 'npm:@smithy/util-utf8@~2',
        ...resolutions,
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
    const yarn = 'yarn';
    const version = execSync(`${yarn} --version`).toString().trim();
    const yarnInstall = version.startsWith('1.')
      ? `${yarn} install --production${
          yarnLockExists ? ' --frozen-lockfile' : ''
        }`
      : `${yarn} install${yarnLockExists ? ' --immutable' : ''}`;

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

  return target;
}
