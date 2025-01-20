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

import * as fs from 'fs-extra';
// @ts-ignore
import isNative from 'is-native-module';
import semver from 'semver';

import path from 'path';

import { Task } from '../../lib/tasks';

export function addToDependenciesForModule({
  dependency,
  dependencies,
  ignoreVersionCheck = [],
  module,
}: {
  dependency: { name: string; version: string };
  dependencies: { [key: string]: string };
  ignoreVersionCheck?: string[];
  module: string;
}): void {
  const existingDependencyVersion = dependencies[dependency.name];
  if (existingDependencyVersion === undefined) {
    dependencies[dependency.name] = dependency.version;
    return;
  }

  if (existingDependencyVersion === dependency.version) {
    return;
  }

  const existingDependencyMinVersion = semver.minVersion(
    existingDependencyVersion,
  );
  if (
    existingDependencyMinVersion &&
    semver.satisfies(existingDependencyMinVersion, dependency.version)
  ) {
    Task.log(
      `Several compatible versions ('${existingDependencyVersion}', '${dependency.version}') of the same transitive dependency ('${dependency.name}') for embedded module ('${module}'): keeping '${existingDependencyVersion}'`,
    );
    return;
  }
  const newDependencyMinVersion = semver.minVersion(dependency.version);
  if (
    newDependencyMinVersion &&
    semver.satisfies(newDependencyMinVersion, existingDependencyVersion)
  ) {
    dependencies[dependency.name] = dependency.version;
    Task.log(
      `Several compatible versions ('${existingDependencyVersion}', '${dependency.version}') of the same transitive dependency ('${dependency.name}') for embedded module ('${module}'): keeping '${dependency.version}'`,
    );
    return;
  }
  if (!ignoreVersionCheck.includes(dependency.name)) {
    throw new Error(
      `Several incompatible versions ('${existingDependencyVersion}', '${dependency.version}') of the same transitive dependency ('${dependency.name}') for embedded module ('${module}')`,
    );
  } else {
    Task.log(
      `Several incompatible versions ('${existingDependencyVersion}', '${dependency.version}') of the same transitive dependency ('${dependency.name}') for embedded module ('${module}') however this has been overridden to use '${dependency.version}'`,
    );
  }
}

export function addToMainDependencies(
  dependenciesToAdd: { [key: string]: string },
  mainDependencies: { [key: string]: string },
  ignoreVersionCheck: string[] = [],
): void {
  for (const dep in dependenciesToAdd) {
    if (!Object.prototype.hasOwnProperty.call(dependenciesToAdd, dep)) {
      continue;
    }
    const existingVersion = mainDependencies[dep];
    if (existingVersion === undefined) {
      mainDependencies[dep] = dependenciesToAdd[dep];
      continue;
    }
    if (existingVersion !== dependenciesToAdd[dep]) {
      const existingMinVersion = semver.minVersion(existingVersion);
      if (
        existingMinVersion &&
        semver.satisfies(existingMinVersion, dependenciesToAdd[dep])
      ) {
        Task.log(
          `The version of a dependency ('${dep}') of an embedded module differs from the main module's dependencies: '${dependenciesToAdd[dep]}', '${existingVersion}': keeping it as it is compatible`,
        );
        continue;
      }
      if (ignoreVersionCheck.includes(dep)) {
        Task.log(
          `The version of a dependency ('${dep}') of an embedded module conflicts with the main module's dependencies: '${dependenciesToAdd[dep]}', '${existingVersion}': however this has been overridden`,
        );
      } else {
        throw new Error(
          `The version of a dependency ('${dep}') of an embedded module conflicts with main module dependencies: '${dependenciesToAdd[dep]}', '${existingVersion}': cannot proceed!`,
        );
      }
    }
  }
}

export function isValidPluginModule(pluginModule: any): boolean {
  return (
    isBackendFeature(pluginModule?.default) ||
    isBackendFeatureFactory(pluginModule?.default) ||
    isBackendDynamicPluginInstaller(pluginModule?.dynamicPluginInstaller)
  );
}

function isBackendFeature(value: unknown): boolean {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    (value as any).$$type === '@backstage/BackendFeature'
  );
}

function isBackendFeatureFactory(value: unknown): boolean {
  return (
    !!value &&
    typeof value === 'function' &&
    (value as any).$$type === '@backstage/BackendFeatureFactory'
  );
}

function isBackendDynamicPluginInstaller(obj: unknown): boolean {
  return (
    obj !== undefined &&
    typeof obj === 'object' &&
    obj !== null &&
    'kind' in obj &&
    obj.kind === 'new' &&
    'install' in obj &&
    typeof obj.install === 'function'
  );
}

export async function* gatherNativeModules(
  pkgPath: string,
): AsyncGenerator<string, void, unknown> {
  if (await fs.pathExists(path.join(pkgPath, 'package.json'))) {
    yield* (async function* anaylzePackageJson() {
      const pkg = JSON.parse(
        (await fs.readFile(path.join(pkgPath, 'package.json'))).toString(
          'utf8',
        ),
      );
      if (isNative(pkg)) {
        yield pkg.name || pkgPath;
      }
    })();
    if (await fs.pathExists(path.join(pkgPath, 'node_modules'))) {
      yield* gatherNativeModules(path.join(pkgPath, 'node_modules'));
    }
  } else {
    for (const file of await fs.readdir(pkgPath)) {
      if ((await fs.stat(path.join(pkgPath, file))).isDirectory()) {
        yield* gatherNativeModules(path.join(pkgPath, file));
      }
    }
  }
}
