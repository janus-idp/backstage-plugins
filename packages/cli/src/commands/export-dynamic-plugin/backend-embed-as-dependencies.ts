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
  const target = path.join(paths.targetDir, 'dist-dynamic');
  const yarn = 'yarn';

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

  const packagesToEmbed = (opts.embedPackage || []) as string[];
  const monoRepoPackages = await getPackages(paths.targetDir);
  const embeddedResolvedPackages = await searchEmbedded(
    pkg,
    packagesToEmbed,
    monoRepoPackages,
    createRequire(`${paths.targetDir}/package.json`),
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
!package.json
!yarn.lock
`,
  );

  const embeddedPeerDependencies: {
    [key: string]: string;
  } = {};

  function embeddedPackageRelativePath(p: ResolvedEmbedded): string {
    return path.join(
      'embedded',
      p.packageName.replace(/^@/, '').replace(/\//, '-'),
    );
  }
  for (const embedded of embeddedResolvedPackages) {
    const customizeManifest = customizeForDynamicUse({
      embedded: embeddedResolvedPackages,
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
              addToDependenciesForModule(
                { name, version },
                embeddedPeerDependencies,
                embeddedPkg.name,
              );
            },
          );
        }
      },
    });
    const embeddedDestDir = path.join(
      target,
      embeddedPackageRelativePath(embedded),
    );
    if (!embedded.alreadyPacked) {
      if (opts.build) {
        Task.log(`Building embedded package ${chalk.cyan(embedded.dir)}`);
        await Task.forCommand(`${yarn} build`, {
          cwd: embedded.dir,
          optional: false,
        });
      }
      Task.log(`Packing embedded package ${chalk.cyan(embedded.dir)}`);
      await productionPack({
        packageDir: embedded.dir,
        targetDir: embeddedDestDir,
        customizeManifest,
      });
    } else {
      Task.log(`Packing embedded package ${chalk.cyan(embedded.dir)}`);
      fs.rmSync(embeddedDestDir, { force: true, recursive: true });
      fs.cpSync(embedded.dir, embeddedDestDir, { recursive: true });
      const embeddedPkgPath = path.join(embeddedDestDir, 'package.json');
      const embeddedPkgContent = await fs.readFile(embeddedPkgPath, 'utf8');
      const embeddedPkg = JSON.parse(
        embeddedPkgContent,
      ) as BackstagePackageJson;
      customizeManifest(embeddedPkg);
      await fs.writeJson(embeddedPkgPath, embeddedPkg, {
        encoding: 'utf8',
        spaces: 2,
      });
    }
  }

  const embeddedDependenciesResolutions: { [key: string]: any } = {};
  embeddedResolvedPackages.map(ep => {
    embeddedDependenciesResolutions[
      ep.packageName
    ] = `file:./${embeddedPackageRelativePath(ep)}`;
  });

  if (opts.build) {
    Task.log(`Building main package`);
    await Task.forCommand(`${yarn} build`, {
      cwd: paths.targetDir,
      optional: false,
    });
  }

  Task.log(`Packing main package`);
  await productionPack({
    packageDir: '',
    targetDir: target,
    customizeManifest: customizeForDynamicUse({
      embedded: embeddedResolvedPackages,
      monoRepoPackages,
      sharedPackages: sharedPackagesRules,
      overridding: {
        name: `${pkg.name}-dynamic`,
        bundleDependencies: true,
        // We remove scripts, because they do not make sense for this derived package.
        // They even bring errors, especially the pre-pack and post-pack ones:
        // we want to be able to use npm pack on this derived package to distribute it as a dynamic plugin,
        // and obviously this should not trigger the backstage pre-pack or post-pack actions
        // which are related to the packaging of the original static package.
        scripts: {},
      },
      additionalResolutions: embeddedDependenciesResolutions,
      after(mainPkg) {
        if (Object.keys(embeddedPeerDependencies).length === 0) {
          return;
        }
        Task.log(
          `Hoisting peer dependencies of embedded packages to the main package`,
        );
        const mainPeerDependencies = mainPkg.peerDependencies || {};
        addToMainDependencies(embeddedPeerDependencies, mainPeerDependencies);
        if (Object.keys(mainPeerDependencies).length > 0) {
          mainPkg.peerDependencies = mainPeerDependencies;
        }
      },
    }),
  });

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

    const version = execSync(`${yarn} --version`).toString().trim();
    const yarnInstall = version.startsWith('1.')
      ? `${yarn} install --production${
          yarnLockExists ? ' --frozen-lockfile' : ''
        }`
      : `${yarn} install${yarnLockExists ? ' --immutable' : ''}`;

    await Task.forCommand(yarnInstall, { cwd: target, optional: false });
    await fs.remove(paths.resolveTarget('dist-dynamic', '.yarn'));

    // Checking if some shared dependencies have been included inside the private dependencies
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
    for await (const n of gatherNativeModules(target)) {
      nativePackages.push(n);
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
            alreadyPacked: resolvedPackage.main?.endsWith('.cjs.js') || false,
          });

          resolved.push(
            ...(await searchEmbedded(
              resolvedPackage,
              embedded,
              monoRepoPackages,
              req,
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

function customizeForDynamicUse(options: {
  embedded: ResolvedEmbedded[];
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
}): (pkg: BackstagePackageJson) => void {
  return (pkgToCustomize: BackstagePackageJson) => {
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
      ...(options.additionalOverrides || {}),
      ...overrides,
    };
    const resolutions = (pkgToCustomize as any).resolutions || {};
    (pkgToCustomize as any).resolutions = {
      // The following lines are a workaround for the fact that the @aws-sdk/util-utf8-browser package
      // is not compatible with the NPM 9+, so that `npm pack` would not grab the Javascript files.
      // This package has been deprecated in favor of @smithy/util-utf8.
      //
      // See https://github.com/aws/aws-sdk-js-v3/issues/5305.
      '@aws-sdk/util-utf8-browser': 'npm:@smithy/util-utf8@~2',
      ...(options.additionalResolutions || {}),
      ...resolutions,
    };

    if (options.after) {
      options.after(pkgToCustomize);
    }
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

  // require plugin main module

  let pluginModule: any | undefined;
  let needsTypeScriptSupport: boolean = false;
  try {
    pluginModule = dynamicPluginRequire(target);
  } catch (e) {
    if (
      e?.name === SyntaxError.name &&
      !dynamicPluginRequire.extensions['.ts']
    ) {
      needsTypeScriptSupport = true;
    } else {
      return `Unable to validate plugin entry points: ${e}`;
    }
  }

  if (needsTypeScriptSupport) {
    Task.log(
      `  adding typescript extension support to enable entry point validation`,
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

    // Retry requiring the plugin main module after adding typescript extensions
    try {
      pluginModule = dynamicPluginRequire(target);
    } catch (e) {
      return `Unable to validate plugin entry points: ${e}`;
    }
  }

  let pluginAlphaModule: any | undefined;
  const alphaPackage = path.resolve(target, 'alpha');
  if (fs.pathExistsSync(alphaPackage)) {
    try {
      pluginAlphaModule = dynamicPluginRequire(alphaPackage);
    } catch (e) {
      return `Unable to validate plugin entry points: ${e}`;
    }
  }

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

  return '';
}
