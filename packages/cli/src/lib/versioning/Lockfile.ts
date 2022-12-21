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
import { parseSyml, stringifySyml } from '@yarnpkg/parsers';
import { stringify as legacyStringifyLockfile } from '@yarnpkg/lockfile';

const ENTRY_PATTERN = /^((?:@[^/]+\/)?[^@/]+)@(.+)$/;

type LockfileData = {
  [entry: string]: {
    version: string;
    resolved?: string;
    integrity?: string;
    dependencies?: { [name: string]: string };
  };
};

type LockfileQueryEntry = {
  range: string;
  version: string;
};

/** Entries that have an invalid version range, for example an npm tag */
type AnalyzeResultInvalidRange = {
  name: string;
  range: string;
};

/** Entries that can be deduplicated by bumping to an existing higher version */
type AnalyzeResultNewVersion = {
  name: string;
  range: string;
  oldVersion: string;
  newVersion: string;
};

/** Entries that would need a dependency update in package.json to be deduplicated */
type AnalyzeResultNewRange = {
  name: string;
  oldRange: string;
  newRange: string;
  oldVersion: string;
  newVersion: string;
};

type AnalyzeResult = {
  invalidRanges: AnalyzeResultInvalidRange[];
  newVersions: AnalyzeResultNewVersion[];
  newRanges: AnalyzeResultNewRange[];
};

function parseLockfile(lockfileContents: string) {
  try {
    return {
      object: parseSyml(lockfileContents),
      type: 'success',
    };
  } catch (err) {
    return {
      object: null,
      type: err,
    };
  }
}

// the new yarn header is handled out of band of the parsing
// https://github.com/yarnpkg/berry/blob/0c5974f193a9397630e9aee2b3876cca62611149/packages/yarnpkg-core/sources/Project.ts#L1741-L1746
const NEW_HEADER = `${[
  `# This file is generated by running "yarn install" inside your project.\n`,
  `# Manual changes might be lost - proceed with caution!\n`,
].join(``)}\n`;

function stringifyLockfile(data: LockfileData, legacy: boolean) {
  return legacy
    ? legacyStringifyLockfile(data)
    : NEW_HEADER + stringifySyml(data);
}
// taken from yarn parser package
// https://github.com/yarnpkg/berry/blob/0c5974f193a9397630e9aee2b3876cca62611149/packages/yarnpkg-parsers/sources/syml.ts#L136
const LEGACY_REGEX = /^(#.*(\r?\n))*?#\s+yarn\s+lockfile\s+v1\r?\n/i;

// these are special top level yarn keys.
// https://github.com/yarnpkg/berry/blob/9bd61fbffb83d0b8166a9cc26bec3a58743aa453/packages/yarnpkg-parsers/sources/syml.ts#L9
const SPECIAL_OBJECT_KEYS = [
  `__metadata`,
  `version`,
  `resolution`,
  `dependencies`,
  `peerDependencies`,
  `dependenciesMeta`,
  `peerDependenciesMeta`,
  `binaries`,
];

export class Lockfile {
  static async load(path: string) {
    const lockfileContents = await fs.readFile(path, 'utf8');
    const legacy = LEGACY_REGEX.test(lockfileContents);
    const lockfile = parseLockfile(lockfileContents);
    if (lockfile.type !== 'success') {
      throw new Error(`Failed yarn.lock parse with ${lockfile.type}`);
    }

    const data = lockfile.object as LockfileData;
    const packages = new Map<string, LockfileQueryEntry[]>();

    for (const [key, value] of Object.entries(data)) {
      if (SPECIAL_OBJECT_KEYS.includes(key)) continue;

      const [, name, ranges] = ENTRY_PATTERN.exec(key) ?? [];
      if (!name) {
        throw new Error(`Failed to parse yarn.lock entry '${key}'`);
      }

      let queries = packages.get(name);
      if (!queries) {
        queries = [];
        packages.set(name, queries);
      }
      for (let range of ranges.split(/\s*,\s*/)) {
        if (range.startsWith(`${name}@`)) {
          range = range.slice(`${name}@`.length);
        }
        if (range.startsWith('npm:')) {
          range = range.slice('npm:'.length);
        }
        queries.push({ range, version: value.version });
      }
    }

    return new Lockfile(path, packages, data, legacy);
  }

  private constructor(
    private readonly path: string,
    private readonly packages: Map<string, LockfileQueryEntry[]>,
    private readonly data: LockfileData,
    private readonly legacy: boolean = false,
  ) {}

  /** Get the entries for a single package in the lockfile */
  get(name: string): LockfileQueryEntry[] | undefined {
    return this.packages.get(name);
  }

  /** Returns the name of all packages available in the lockfile */
  keys(): IterableIterator<string> {
    return this.packages.keys();
  }

  /** Analyzes the lockfile to identify possible actions and warnings for the entries */
  analyze(options?: { filter?: (name: string) => boolean }): AnalyzeResult {
    const { filter } = options ?? {};
    const result: AnalyzeResult = {
      invalidRanges: [],
      newVersions: [],
      newRanges: [],
    };

    for (const [name, allEntries] of this.packages) {
      if (filter && !filter(name)) {
        continue;
      }

      // Get rid of and signal any invalid ranges upfront
      const invalid = allEntries.filter(e => !semver.validRange(e.range));
      result.invalidRanges.push(
        ...invalid.map(({ range }) => ({ name, range })),
      );

      // Grab all valid entries, if there aren't at least 2 different valid ones we're done
      const entries = allEntries.filter(e => semver.validRange(e.range));
      if (entries.length < 2) {
        continue;
      }

      // Find all versions currently in use
      const versions = Array.from(new Set(entries.map(e => e.version)))
        .map(v => {
          // Translate workspace:^ references to the actual version
          return v === '0.0.0-use.local'
            ? require(`${name}/package.json`).version
            : v;
        })
        .sort((v1, v2) => semver.rcompare(v1, v2));

      // If we're not using at least 2 different versions we're done
      if (versions.length < 2) {
        continue;
      }

      const acceptedVersions = new Set<string>();
      for (const { version, range } of entries) {
        // Finds the highest matching version from the the known versions
        // TODO(Rugvip): We may want to select the version that satisfies the most ranges rather than the highest one
        const acceptedVersion = versions.find(v => semver.satisfies(v, range));
        if (!acceptedVersion) {
          throw new Error(
            `No existing version was accepted for range ${range}, searching through ${versions}, for package ${name}`,
          );
        }

        if (acceptedVersion !== version) {
          result.newVersions.push({
            name,
            range,
            newVersion: acceptedVersion,
            oldVersion: version,
          });
        }

        acceptedVersions.add(acceptedVersion);
      }

      // If all ranges were able to accept the same version, we're done
      if (acceptedVersions.size === 1) {
        continue;
      }

      // Find the max version that we may want bump older packages to
      const maxVersion = Array.from(acceptedVersions).sort(semver.rcompare)[0];
      // Find all existing ranges that satisfy the new max version, and pick the one that
      // results in the highest minimum allowed version, usually being the more specific one
      const maxEntry = entries
        .filter(e => semver.satisfies(maxVersion, e.range))
        .map(e => ({ e, min: semver.minVersion(e.range) }))
        .filter(p => p.min)
        .sort((a, b) => semver.rcompare(a.min!, b.min!))[0]?.e;
      if (!maxEntry) {
        throw new Error(
          `No entry found that satisfies max version '${maxVersion}'`,
        );
      }

      // Find all entries that don't satisfy the max version
      for (const { version, range } of entries) {
        if (semver.satisfies(maxVersion, range)) {
          continue;
        }

        result.newRanges.push({
          name,
          oldRange: range,
          newRange: maxEntry.range,
          oldVersion: version,
          newVersion: maxVersion,
        });
      }
    }

    return result;
  }

  remove(name: string, range: string): boolean {
    const query = `${name}@${range}`;
    const existed = Boolean(this.data[query]);
    delete this.data[query];

    const newEntries = this.packages.get(name)?.filter(e => e.range !== range);
    if (newEntries) {
      this.packages.set(name, newEntries);
    }

    return existed;
  }

  /** Modifies the lockfile by bumping packages to the suggested versions */
  replaceVersions(results: AnalyzeResultNewVersion[]) {
    for (const { name, range, oldVersion, newVersion } of results) {
      const query = `${name}@${range}`;

      // Update the backing data
      const entryData = this.data[query];
      if (!entryData) {
        throw new Error(`No entry data for ${query}`);
      }
      if (entryData.version !== oldVersion) {
        throw new Error(
          `Expected existing version data for ${query} to be ${oldVersion}, was ${entryData.version}`,
        );
      }

      // Modifying the data in the entry is not enough, we need to reference an existing version object
      const matchingEntry = Object.entries(this.data).find(
        ([q, e]) => q.startsWith(`${name}@`) && e.version === newVersion,
      );
      if (!matchingEntry) {
        throw new Error(
          `No matching entry found for ${name} at version ${newVersion}`,
        );
      }
      this.data[query] = matchingEntry[1];

      // Update our internal data structure
      const entry = this.packages.get(name)?.find(e => e.range === range);
      if (!entry) {
        throw new Error(`No entry data for ${query}`);
      }
      if (entry.version !== oldVersion) {
        throw new Error(
          `Expected existing version data for ${query} to be ${oldVersion}, was ${entryData.version}`,
        );
      }
      entry.version = newVersion;
    }
  }

  async save() {
    await fs.writeFile(this.path, this.toString(), 'utf8');
  }

  toString() {
    return stringifyLockfile(this.data, this.legacy);
  }
}
