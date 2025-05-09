/*
 * Copyright 2024 The Backstage Authors
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

import { BackstagePackageJson } from '@backstage/cli-node';

import { getPackages, Packages } from '@manypkg/get-packages';
import { parseSyml } from '@yarnpkg/parsers';
import chalk from 'chalk';
import { OptionValues } from 'commander';
import * as fs from 'fs-extra';
import * as semver from 'semver';

import { execSync } from 'child_process';
import { createRequire } from 'node:module';
import * as path from 'path';

import { productionPack } from '../../lib/packager/productionPack';
import { paths } from '../../lib/paths';
import { Task } from '../../lib/tasks';
import { Lockfile } from '../../lib/versioning';
import {
  addToDependenciesForModule,
  addToMainDependencies,
  gatherNativeModules,
  isValidPluginModule,
} from './backend-utils';

export async function backend(opts: OptionValues): Promise<string> {
  const targetRelativePath = 'dist-dynamic';
  const target = path.join(paths.targetDir, targetRelativePath);
  const yarn = 'yarn';
  const yarnVersion = execSync(`${yarn} --version`).toString().trim(); // NOSONAR

  const pkgContent = await fs.readFile(
    paths.resolveTarget('package.json'),
    'utf8',
  );
  const pkg = JSON.parse(pkgContent) as BackstagePackageJson;
  if (pkg.bundled) {
    throw new Error(
      `Packages exported as dynamic backend plugins should not have the ${chalk.cyan(
        'bundled',
      )} field set to ${chalk.cyan('true')}`,
    );
  }

  const derivedPackageName = `${pkg.name}-dynamic`;
  const packagesToEmbed = (opts.embedPackage || []) as string[];
  const allowNative = (opts.allowNativePackage || []) as string[];
  const suppressNative = (opts.suppressNativePackage || []) as string[];
  const ignoreVersionCheck = (opts.ignoreVersionCheck || []) as string[];
  const monoRepoPackages = await getPackages(paths.targetDir);
  const embeddedResolvedPackages = await searchEmbedded(
    pkg,
    packagesToEmbed,
    monoRepoPackages,
    createRequire(path.join(paths.targetDir, 'package.json')),
    [],
  );
  const embeddedPackages = embeddedResolvedPackages.map(e => e.packageName);
  const unusedEmbeddedPackages = packagesToEmbed.filter(
    e => !embeddedPackages.includes(e),
  );
  if (unusedEmbeddedPackages.length > 0) {
    Task.log(
      chalk.yellow(
        `Some embedded packages are not part of the plugin transitive dependencies:${chalk.cyan(
          ['', ...unusedEmbeddedPackages].join('\n- '),
        )}`,
      ),
    );
  }

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
  dontMoveToPeerDependencies.push(...embeddedPackages);

  const sharedPackagesRules: SharedPackagesRules = {
    include: moveToPeerDependencies,
    exclude: dontMoveToPeerDependencies,
  };

  if (opts.clean) {
    await fs.remove(target);
  }

  await fs.mkdirs(target);
  await fs.writeFile(
    path.join(target, '.gitignore'),
    `
*
${
  opts.trackDynamicManifestAndLockFile
    ? `
!package.json
!yarn.lock
`
    : ''
}`,
  );

  if (suppressNative.length > 0) {
    for (const toSuppress of suppressNative) {
      await fs.mkdirs(path.join(target, 'embedded', toSuppress));
      await fs.writeFile(
        path.join(target, 'embedded', toSuppress, 'package.json'),
        JSON.stringify(
          {
            name: toSuppress,
            main: 'index.js',
          },
          undefined,
          2,
        ),
      );
      await fs.writeFile(
        path.join(target, 'embedded', toSuppress, 'index.js'),
        `
throw new Error(
  'The package "${toSuppress}" has been marked as a native module and removed from this dynamic plugin package "${derivedPackageName}", as native modules are not currently supported by dynamic plugins'
);`,
      );
    }
  }

  const embeddedPeerDependencies: {
    [key: string]: string;
  } = {};

  for (const embedded of embeddedResolvedPackages) {
    const embeddedDestRelativeDir = embeddedPackageRelativePath(embedded);
    const embeddedDestDir = path.join(target, embeddedDestRelativeDir);
    if (!embedded.alreadyPacked) {
      if (opts.build) {
        Task.log(
          `Building embedded package ${chalk.cyan(
            embedded.packageName,
          )} in ${chalk.cyan(embedded.dir)}`,
        );
        await Task.forCommand(`${yarn} build`, {
          cwd: embedded.dir,
          optional: false,
        });
      }
      Task.log(
        `Packing embedded package ${chalk.cyan(
          embedded.packageName,
        )} in ${chalk.cyan(embedded.dir)} to ${chalk.cyan(
          embeddedDestRelativeDir,
        )}`,
      );
      await productionPack({
        packageDir: embedded.dir,
        targetDir: embeddedDestDir,
      });
    } else {
      Task.log(
        `Copying embedded package ${chalk.cyan(
          embedded.packageName,
        )} from ${chalk.cyan(embedded.dir)} to ${chalk.cyan(
          embeddedDestRelativeDir,
        )}`,
      );
      fs.rmSync(embeddedDestDir, { force: true, recursive: true });
      fs.cpSync(embedded.dir, embeddedDestDir, { recursive: true });
    }

    // Remove the `node_modules` sub-folder of the embedded package,
    // if it has been copied (in the case typical case of wrappers).
    if (fs.pathExistsSync(path.join(embeddedDestDir, 'node_modules'))) {
      fs.rmSync(path.join(embeddedDestDir, 'node_modules'), {
        force: true,
        recursive: true,
      });
    }

    Task.log(
      `Customizing embedded package ${chalk.cyan(
        embedded.packageName,
      )} for dynamic loading`,
    );
    await customizeForDynamicUse({
      embedded: embeddedResolvedPackages,
      isYarnV1: yarnVersion.startsWith('1.'),
      monoRepoPackages,
      sharedPackages: sharedPackagesRules,
      overridding: {
        private: true,
        version: `${embedded.version}+embedded`,
      },
      after: embeddedPkg => {
        if (embeddedPkg.peerDependencies) {
          Object.entries(embeddedPkg.peerDependencies).forEach(
            ([name, version]) => {
              addToDependenciesForModule({
                dependency: { name, version },
                dependencies: embeddedPeerDependencies,
                ignoreVersionCheck,
                module: embeddedPkg.name,
              });
            },
          );
        }
      },
    })(path.join(embeddedDestDir, 'package.json'));
  }

  const embeddedDependenciesResolutions = embeddedResolvedPackages.reduce(
    (resolutions, embeddedPkg) => ({
      ...resolutions,
      ...{
        [embeddedPkg.packageName]: `file:./${embeddedPackageRelativePath(embeddedPkg)}`,
      },
    }),
    {},
  );

  if (opts.build) {
    Task.log(`Building main package`);
    await Task.forCommand(`${yarn} build`, {
      cwd: paths.targetDir,
      optional: false,
    });
  }

  Task.log(
    `Packing main package to ${chalk.cyan(
      path.join(targetRelativePath, 'package.json'),
    )}`,
  );
  await productionPack({
    packageDir: '',
    targetDir: target,
  });

  // Small cleanup in case the `dist-dynamic` entry was still in the `files` of the main plugin package.
  if (fs.pathExistsSync(path.join(target, 'dist-dynamic'))) {
    fs.rmSync(path.join(target, 'dist-dynamic'), {
      force: true,
      recursive: true,
    });
  }

  Task.log(
    `Customizing main package in ${chalk.cyan(
      path.join(targetRelativePath, 'package.json'),
    )} for dynamic loading`,
  );
  await customizeForDynamicUse({
    embedded: embeddedResolvedPackages,
    isYarnV1: yarnVersion.startsWith('1.'),
    monoRepoPackages,
    sharedPackages: sharedPackagesRules,
    overridding: {
      name: derivedPackageName,
      bundleDependencies: true,
      // We remove scripts, because they do not make sense for this derived package.
      // They even bring errors, especially the pre-pack and post-pack ones:
      // we want to be able to use npm pack on this derived package to distribute it as a dynamic plugin,
      // and obviously this should not trigger the backstage pre-pack or post-pack actions
      // which are related to the packaging of the original static package.
      scripts: {},
    },
    additionalResolutions: {
      ...embeddedDependenciesResolutions,
      ...suppressNative
        .map((nativePkg: string) => ({
          [nativePkg]: path.join('file:./embedded', nativePkg),
        }))
        .reduce((prev, curr) => ({ ...prev, ...curr }), {}),
    },
    after(mainPkg) {
      if (Object.keys(embeddedPeerDependencies).length === 0) {
        return;
      }
      Task.log(
        `Hoisting peer dependencies of embedded packages to the main package`,
      );
      const mainPeerDependencies = mainPkg.peerDependencies || {};
      addToMainDependencies(
        embeddedPeerDependencies,
        mainPeerDependencies,
        ignoreVersionCheck,
      );
      if (Object.keys(mainPeerDependencies).length > 0) {
        mainPkg.peerDependencies = mainPeerDependencies;
      }
    },
  })(path.resolve(target, 'package.json'));

  const yarnLock = path.resolve(target, 'yarn.lock');
  const yarnLockExists = await fs.pathExists(yarnLock);

  if (!yarnLockExists) {
    // Search the yarn.lock of the static plugin, possibly at the root of the monorepo.

    let staticPluginYarnLock: string | undefined;
    if (await fs.pathExists(path.join(paths.targetDir, 'yarn.lock'))) {
      staticPluginYarnLock = path.join(paths.targetDir, 'yarn.lock');
    } else if (await fs.pathExists(path.join(paths.targetRoot, 'yarn.lock'))) {
      staticPluginYarnLock = path.join(paths.targetRoot, 'yarn.lock');
    }

    if (!staticPluginYarnLock) {
      throw new Error(
        `Could not find the static plugin ${chalk.cyan(
          'yarn.lock',
        )} file in either the local folder or the monorepo root (${chalk.cyan(
          paths.targetRoot,
        )})`,
      );
    }

    await fs.copyFile(staticPluginYarnLock, yarnLock);

    if (!opts.install) {
      Task.log(
        chalk.yellow(
          `Last export step (${chalk.cyan(
            'yarn install',
          )} has been disabled: the dynamic plugin package ${chalk.cyan(
            'yarn.lock',
          )} file will be inconsistent until ${chalk.cyan(
            'yarn install',
          )} is run manually`,
        ),
      );
    }
  }

  if (opts.install) {
    Task.log(`Installing private dependencies of the main package`);

    const logFile = 'yarn-install.log';
    const redirect = `> ${logFile}`;
    const yarnInstall = yarnVersion.startsWith('1.')
      ? `${yarn} install --production${
          yarnLockExists ? ' --frozen-lockfile' : ''
        } ${redirect}`
      : `${yarn} install${yarnLockExists ? ' --immutable' : ' --no-immutable'} ${redirect}`;

    await Task.forCommand(yarnInstall, { cwd: target, optional: false });
    await fs.remove(paths.resolveTarget(targetRelativePath, '.yarn'));

    // Checking if some shared dependencies have been included inside the private dependencies
    Task.log(`Validating private dependencies`);
    const lockFile = await Lockfile.load(yarnLock);
    const sharedPackagesInPrivateDeps: string[] = [];
    for (const key of lockFile.keys()) {
      const entry = lockFile.get(key);
      if (!entry) {
        continue;
      }
      if (`${pkg.name}-dynamic` === key) {
        continue;
      }
      if (embeddedPackages.includes(key)) {
        continue;
      }
      if (isPackageShared(key, sharedPackagesRules)) {
        sharedPackagesInPrivateDeps.push(key);
      }
    }
    if (sharedPackagesInPrivateDeps.length > 0) {
      // Some shared dependencies have been included inside the private dependencies
      //   => analyze the yarn.lock file to guess from which direct dependencies they
      //   were imported.

      const dynamicPkgContent = await fs.readFile(
        path.resolve(target, 'package.json'),
        'utf8',
      );

      const dynamicPkg = JSON.parse(dynamicPkgContent) as BackstagePackageJson;
      const lockfileContents = await fs.readFile(yarnLock, 'utf8');
      let data: any;
      try {
        data = parseSyml(lockfileContents);
      } catch (err) {
        throw new Error(`Failed parsing ${chalk.cyan(yarnLock)}: ${err}`);
      }

      const packagesToProbablyEmbed: string[] = [];
      for (const dep in dynamicPkg.dependencies || []) {
        if (
          !Object.prototype.hasOwnProperty.call(dynamicPkg.dependencies, dep)
        ) {
          continue;
        }
        const matchingEntry = Object.entries(data).find(([q, _]) => {
          return (
            q.startsWith(`${dep}@`) &&
            (q.includes(`@${dynamicPkg.dependencies![dep]}`) ||
              q.includes(`@npm:${dynamicPkg.dependencies![dep]}`))
          );
        });

        if (matchingEntry) {
          const yarnEntry = matchingEntry[1] as any;
          if (yarnEntry.dependencies) {
            if (
              Object.keys(yarnEntry.dependencies).some(d => {
                return isPackageShared(d, sharedPackagesRules);
              })
            ) {
              packagesToProbablyEmbed.push(dep);
            }
          }
        }
      }

      throw new Error(
        `Following shared package(s) should not be part of the plugin private dependencies:${chalk.cyan(
          ['', ...sharedPackagesInPrivateDeps].join('\n- '),
        )}\n\nEither unshare them with the ${chalk.cyan(
          '--shared-package !<package>',
        )} option, or use the ${chalk.cyan(
          '--embed-package',
        )} to embed the following packages which use shared dependencies:${chalk.cyan(
          ['', ...packagesToProbablyEmbed].join('\n- '),
        )}`,
      );
    }

    // Check whether private dependencies contain native modules, and fail for now (not supported).
    const nativePackages: string[] = [];
    for await (const nativePkg of gatherNativeModules(target)) {
      if (!allowNative.includes(nativePkg)) {
        nativePackages.push(nativePkg);
      }
    }

    if (nativePackages.length > 0) {
      throw new Error(
        `Dynamic plugins do not support native plugins. the following native modules have been transitively detected:${chalk.cyan(
          ['', ...nativePackages].join('\n- '),
        )}`,
      );
    }

    // Check that the backend plugin provides expected entrypoints.
    Task.log(`Validating plugin entry points`);
    const validateEntryPointsError = validatePluginEntryPoints(target);
    if (validateEntryPointsError) {
      throw new Error(validateEntryPointsError);
    }
    // everything is fine, remove the yarn install log
    await fs.remove(paths.resolveTarget(targetRelativePath, logFile));
  }
  return target;
}

type ResolvedEmbedded = {
  packageName: string;
  version: string;
  dir: string;
  parentPackageName: string;
  alreadyPacked: boolean;
};

async function searchEmbedded(
  pkg: BackstagePackageJson,
  packagesToEmbed: string[],
  monoRepoPackages: Packages,
  req: NodeRequire,
  alreadyResolved: ResolvedEmbedded[],
): Promise<ResolvedEmbedded[]> {
  const embedded = [...packagesToEmbed];
  let regex: RegExp | undefined = undefined;
  switch (pkg.backstage?.role) {
    case 'backend-plugin':
      regex = /-backend$/;
      break;
    case 'backend-plugin-module':
      regex = /-backend-module-.+$/;
      break;
    case 'node-library':
      regex = /-node$/;
      break;
    default:
  }
  if (regex) {
    const commonPackage = pkg.name.replace(regex, '-common');
    if (
      commonPackage !== pkg.name &&
      !alreadyResolved.find(r => r.packageName === commonPackage)
    ) {
      embedded.push(commonPackage);
    }
    const nodePackage = pkg.name.replace(regex, '-node');
    if (
      nodePackage !== pkg.name &&
      !alreadyResolved.find(r => r.packageName === nodePackage)
    ) {
      embedded.push(nodePackage);
    }
  }

  const resolved: ResolvedEmbedded[] = [];
  if (pkg.dependencies) {
    for (const dep in pkg.dependencies || []) {
      if (!Object.prototype.hasOwnProperty.call(pkg.dependencies, dep)) {
        continue;
      }

      if (embedded.includes(dep)) {
        const dependencyVersion = pkg.dependencies[dep];

        const relatedMonoRepoPackages = monoRepoPackages.packages.filter(
          p => p.packageJson.name === dep,
        );
        if (relatedMonoRepoPackages.length > 1) {
          throw new Error(
            `Two packages named '${dep}' exist in the monorepo structure: this is not supported.`,
          );
        }

        if (
          relatedMonoRepoPackages.length === 0 &&
          dependencyVersion.startsWith('workspace:')
        ) {
          throw new Error(
            `No package named '${dep}' exist in the monorepo structure.`,
          );
        }

        let resolvedPackage: BackstagePackageJson | undefined;
        let resolvedPackageDir: string;
        let alreadyPacked = false;
        if (relatedMonoRepoPackages.length === 1) {
          const monoRepoPackage = relatedMonoRepoPackages[0];

          let isResolved: boolean = false;
          if (dependencyVersion.startsWith('workspace:')) {
            isResolved = checkWorkspacePackageVersion(dependencyVersion, {
              dir: monoRepoPackage.dir,
              version: monoRepoPackage.packageJson.version,
            });
          } else if (
            semver.satisfies(
              monoRepoPackage.packageJson.version,
              dependencyVersion,
            )
          ) {
            isResolved = true;
          }

          if (!isResolved) {
            throw new Error(
              `Monorepo package named '${dep}' at '${monoRepoPackage.dir}' doesn't satisfy dependency version requirement in parent package '${pkg.name}'.`,
            );
          }
          resolvedPackage = JSON.parse(
            await fs.readFile(
              paths.resolveTarget(
                path.join(monoRepoPackage.dir, 'package.json'),
              ),
              'utf8',
            ),
          ) as BackstagePackageJson;
          resolvedPackageDir = monoRepoPackage.dir;
        } else {
          // Not found as a source package in the monorepo (if any).
          // Let's try to find the package through a require call.
          const resolvedPackageJson = req.resolve(
            path.join(dep, 'package.json'),
          );
          resolvedPackageDir = path.dirname(resolvedPackageJson);
          resolvedPackage = JSON.parse(
            await fs.readFile(resolvedPackageJson, 'utf8'),
          ) as BackstagePackageJson;

          if (!semver.satisfies(resolvedPackage.version, dependencyVersion)) {
            throw new Error(
              `Resolved package named '${dep}' at '${resolvedPackageDir}' doesn't satisfy dependency version requirement in parent package '${pkg.name}': '${resolvedPackage.version}', '${dependencyVersion}'.`,
            );
          }
          alreadyPacked = !resolvedPackage.main?.endsWith('.ts');
        }

        if (resolvedPackage.bundled) {
          throw new Error(
            'Packages embedded inside dynamic backend plugins should not have the "bundled" field set to true',
          );
        }

        if (
          ![...alreadyResolved, ...resolved].find(
            p => p.dir === resolvedPackageDir,
          )
        ) {
          resolved.push({
            dir: resolvedPackageDir,
            packageName: resolvedPackage.name,
            version: resolvedPackage.version ?? '0.0.0',
            parentPackageName: pkg.name,
            alreadyPacked,
          });
          // scan for embedded packages under the resolved package
          resolved.push(
            ...(await searchEmbedded(
              resolvedPackage,
              embedded,
              monoRepoPackages,
              createRequire(path.join(resolvedPackageDir, 'package.json')),
              [...alreadyResolved, ...resolved],
            )),
          );
        }
      }
    }
  }
  return resolved;
}

function checkWorkspacePackageVersion(
  requiredVersionSpec: string,
  pkg: { version: string; dir: string },
): boolean {
  const versionDetail = requiredVersionSpec.replace(/^workspace:/, '');

  return (
    pkg.dir === versionDetail ||
    versionDetail === '*' ||
    versionDetail === '~' ||
    versionDetail === '^' ||
    semver.satisfies(pkg.version, versionDetail)
  );
}

export function customizeForDynamicUse(options: {
  embedded: ResolvedEmbedded[];
  isYarnV1: boolean;
  monoRepoPackages: Packages | undefined;
  sharedPackages?: SharedPackagesRules | undefined;
  overridding?:
    | (Partial<BackstagePackageJson> & {
        bundleDependencies?: boolean;
      })
    | undefined;
  additionalOverrides?: { [key: string]: any } | undefined;
  additionalResolutions?: { [key: string]: any } | undefined;
  after?: ((pkg: BackstagePackageJson) => void) | undefined;
}): (dynamicPkgPath: string) => Promise<void> {
  return async (dynamicPkgPath: string): Promise<void> => {
    const dynamicPkgContent = await fs.readFile(dynamicPkgPath, 'utf8');
    const pkgToCustomize = JSON.parse(
      dynamicPkgContent,
    ) as BackstagePackageJson;

    for (const field in options.overridding || {}) {
      if (!Object.prototype.hasOwnProperty.call(options.overridding, field)) {
        continue;
      }
      (pkgToCustomize as any)[field] = (options.overridding as any)[field];
    }

    pkgToCustomize.files = pkgToCustomize.files?.filter(
      f => !f.startsWith('dist-dynamic/'),
    );

    if (pkgToCustomize.dependencies) {
      for (const dep in pkgToCustomize.dependencies) {
        if (
          !Object.prototype.hasOwnProperty.call(
            pkgToCustomize.dependencies,
            dep,
          )
        ) {
          continue;
        }

        const dependencyVersionSpec = pkgToCustomize.dependencies[dep];
        if (dependencyVersionSpec.startsWith('workspace:')) {
          let resolvedVersion: string | undefined;
          const rangeSpecifier = dependencyVersionSpec.replace(
            /^workspace:/,
            '',
          );
          const embeddedDep = options.embedded.find(
            e =>
              e.packageName === dep &&
              checkWorkspacePackageVersion(dependencyVersionSpec, e),
          );
          if (embeddedDep) {
            resolvedVersion = embeddedDep.version;
          } else if (options.monoRepoPackages) {
            const relatedMonoRepoPackages =
              options.monoRepoPackages.packages.filter(
                p => p.packageJson.name === dep,
              );
            if (relatedMonoRepoPackages.length > 1) {
              throw new Error(
                `Two packages named ${chalk.cyan(
                  dep,
                )} exist in the monorepo structure: this is not supported.`,
              );
            }
            if (
              relatedMonoRepoPackages.length === 1 &&
              checkWorkspacePackageVersion(dependencyVersionSpec, {
                dir: relatedMonoRepoPackages[0].dir,
                version: relatedMonoRepoPackages[0].packageJson.version,
              })
            ) {
              resolvedVersion =
                rangeSpecifier === '^' || rangeSpecifier === '~'
                  ? rangeSpecifier +
                    relatedMonoRepoPackages[0].packageJson.version
                  : relatedMonoRepoPackages[0].packageJson.version;
            }
          }

          if (!resolvedVersion) {
            throw new Error(
              `Workspace dependency ${chalk.cyan(dep)} of package ${chalk.cyan(
                pkgToCustomize.name,
              )} doesn't exist in the monorepo structure: maybe you should embed it ?`,
            );
          }

          pkgToCustomize.dependencies[dep] = resolvedVersion;
        }

        if (isPackageShared(dep, options.sharedPackages)) {
          Task.log(`  moving ${chalk.cyan(dep)} to peerDependencies`);

          pkgToCustomize.peerDependencies ||= {};
          pkgToCustomize.peerDependencies[dep] =
            pkgToCustomize.dependencies[dep];
          delete pkgToCustomize.dependencies[dep];

          continue;
        }

        // If yarn v1, then detect if the current dep is an embedded one,
        // and if it is the case replace the version by the file protocol
        // (like what we do for the resolutions).
        if (options.isYarnV1) {
          const embeddedDep = options.embedded.find(
            e =>
              e.packageName === dep &&
              checkWorkspacePackageVersion(dependencyVersionSpec, e),
          );
          if (embeddedDep) {
            pkgToCustomize.dependencies[dep] =
              `file:./${embeddedPackageRelativePath(embeddedDep)}`;
          }
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

    // additionalOverrides and additionalResolutions will override the
    // current package.json entries for "overrides" and "resolutions"
    // respectively
    const overrides = (pkgToCustomize as any).overrides || {};
    (pkgToCustomize as any).overrides = {
      // The following lines are a workaround for the fact that the @aws-sdk/util-utf8-browser package
      // is not compatible with the NPM 9+, so that `npm pack` would not grab the Javascript files.
      // This package has been deprecated in favor of @smithy/util-utf8.
      //
      // See https://github.com/aws/aws-sdk-js-v3/issues/5305.
      '@aws-sdk/util-utf8-browser': {
        '@smithy/util-utf8': '^2.0.0',
      },
      ...overrides,
      ...(options.additionalOverrides || {}),
    };
    const resolutions = (pkgToCustomize as any).resolutions || {};
    (pkgToCustomize as any).resolutions = {
      // The following lines are a workaround for the fact that the @aws-sdk/util-utf8-browser package
      // is not compatible with the NPM 9+, so that `npm pack` would not grab the Javascript files.
      // This package has been deprecated in favor of @smithy/util-utf8.
      //
      // See https://github.com/aws/aws-sdk-js-v3/issues/5305.
      '@aws-sdk/util-utf8-browser': 'npm:@smithy/util-utf8@~2',
      ...resolutions,
      ...(options.additionalResolutions || {}),
    };

    if (options.after) {
      options.after(pkgToCustomize);
    }

    await fs.writeJson(dynamicPkgPath, pkgToCustomize, {
      encoding: 'utf8',
      spaces: 2,
    });
  };
}

type SharedPackagesRules = {
  include: (string | RegExp)[];
  exclude: (string | RegExp)[];
};

function isPackageShared(
  pkgName: string,
  rules: SharedPackagesRules | undefined,
) {
  function test(str: string, expr: string | RegExp): boolean {
    if (typeof expr === 'string') {
      return str === expr;
    }
    return expr.test(str);
  }

  if ((rules?.exclude || []).some(dontMove => test(pkgName, dontMove))) {
    return false;
  }

  if ((rules?.include || []).some(move => test(pkgName, move))) {
    return true;
  }

  return false;
}

function validatePluginEntryPoints(target: string): string {
  const dynamicPluginRequire = createRequire(`${target}/package.json`);

  function requireModule(modulePath: string): any {
    try {
      return dynamicPluginRequire(modulePath);
    } catch (e) {
      // Retry only if we failed with SyntaxError or unsupported dir format
      // because the `ts` require extension was not there.  Else we should
      // throw.
      if (
        (e?.code !== 'ERR_UNSUPPORTED_DIR_IMPORT' &&
          e?.name !== SyntaxError.name) ||
        dynamicPluginRequire.extensions['.ts'] !== undefined
      ) {
        throw e;
      }
    }

    Task.log(
      `  adding typescript extension support to enable entry point validation`,
    );

    let nodeTransform: string | undefined;
    try {
      nodeTransform = dynamicPluginRequire.resolve(
        '@backstage/cli/config/nodeTransform.cjs',
      );
    } catch (e) {
      Task.log(
        `    => unable to find '@backstage/cli/config/nodeTransform.cjs' in the plugin context`,
      );
    }

    if (nodeTransform) {
      dynamicPluginRequire(nodeTransform);
    } else {
      Task.log(
        `    => searching for 'ts-node' (legacy mode before backage 1.24.0)`,
      );

      let tsNode: string | undefined;
      try {
        tsNode = dynamicPluginRequire.resolve('ts-node');
      } catch (e) {
        Task.log(`    => unable to find 'ts-node' in the plugin context`);
      }

      if (tsNode) {
        dynamicPluginRequire(tsNode).register({
          transpileOnly: true,
          project: path.resolve(paths.targetRoot, 'tsconfig.json'),
          compilerOptions: {
            module: 'CommonJS',
          },
        });
      }
    }

    // Retry requiring the plugin main module after adding typescript extensions
    return dynamicPluginRequire(modulePath);
  }

  try {
    const pluginModule = requireModule(target);
    const alphaPackage = path.resolve(target, 'alpha');
    const pluginAlphaModule = fs.pathExistsSync(alphaPackage)
      ? requireModule(alphaPackage)
      : undefined;

    if (
      ![pluginAlphaModule, pluginModule]
        .filter(m => m !== undefined)
        .some(isValidPluginModule)
    ) {
      return `Backend plugin is not valid for dynamic loading: it should either export a ${chalk.cyan(
        'BackendFeature',
      )} or ${chalk.cyan(
        'BackendFeatureFactory',
      )} as default export, or export a ${chalk.cyan(
        'const dynamicPluginInstaller: BackendDynamicPluginInstaller',
      )} field as dynamic loading entrypoint`;
    }
  } catch (e) {
    return `Unable to validate plugin entry points: ${e}`;
  }

  return '';
}

function embeddedPackageRelativePath(p: ResolvedEmbedded): string {
  return path.join(
    'embedded',
    p.packageName.replace(/^@/, '').replace(/\//, '-'),
  );
}
