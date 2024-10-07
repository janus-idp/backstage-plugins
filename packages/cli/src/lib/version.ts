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
import semver from 'semver';

/* eslint-disable @backstage/no-relative-monorepo-imports */

/*
This is a list of all packages used by the templates. If dependencies are added or removed,
this list should be updated as well.

The list, and the accompanying devDependencies entries, are here to ensure correct versioning
and bumping of this package. Without this list the version would not be bumped unless we
manually trigger a release.

This does not create an actual dependency on these packages and does not bring in any code.
Rollup will extract the value of the version field in each package at build time without
leaving any imports in place.
*/
/**
 * In @backstage/cli from 1.18.0 these imports are a block of static imports of
 * various core backstage packages
 */
import Manifest from '../../package.json';
import { paths } from './paths';
import { Lockfile } from './versioning';

export function findVersion() {
  const pkgContent = fs.readFileSync(paths.resolveOwn('package.json'), 'utf8');
  return JSON.parse(pkgContent).version;
}

export const version = findVersion();

/**
 * This packageVersions takes the place of the static imports used in
 * @backstage/cli by building this list based on the @janus-idp/cli package.
 */
export const packageVersions: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(Manifest.devDependencies as Record<string, string>).filter(
      ([k, _v]) => k.startsWith('@backstage/'),
    ),
  ),
  ...Object.fromEntries(
    Object.entries(Manifest.dependencies as Record<string, string>).filter(
      ([k, _v]) => k.startsWith('@backstage/'),
    ),
  ),
  '@janus-idp/cli': version,
};

export function createPackageVersionProvider(lockfile?: Lockfile) {
  return (name: string, versionHint?: string): string => {
    const packageVersion = packageVersions[name];
    const targetVersion = versionHint || packageVersion;
    if (!targetVersion) {
      throw new Error(`No version available for package ${name}`);
    }

    const lockfileEntries = lockfile?.get(name);
    if (
      name.startsWith('@types/') &&
      lockfileEntries?.some(entry => entry.range === '*')
    ) {
      return '*';
    }

    for (const specifier of ['^', '~', '*']) {
      const range = `workspace:${specifier}`;
      if (lockfileEntries?.some(entry => entry.range === range)) {
        return range;
      }
    }

    const validRanges = lockfileEntries?.filter(entry =>
      semver.satisfies(targetVersion, entry.range),
    );
    const highestRange = validRanges?.slice(-1)[0];

    /**
     * These return statements differ from @backstage/cli by locking the
     * package dependencies to the exact version rather than accepting a range.
     */
    if (highestRange?.range) {
      return highestRange?.range.replace(/^\^/, '');
    }
    if (packageVersion) {
      return packageVersion.replace(/^\^/, '');
    }
    if (semver.parse(versionHint)?.prerelease.length) {
      return versionHint!;
    }
    return versionHint!.replace(/^\^/, '');
  };
}
