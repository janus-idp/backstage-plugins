/*
 * Copyright 2020 Spotify AB
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
import { Command } from 'commander';
import { Lockfile } from '../../lib/versioning';
import { paths } from '../../lib/paths';
import partition from 'lodash/partition';

// Packages that we try to avoid duplicates for
const INCLUDED = [/^@backstage\//];

// Packages that are not allowed to have any duplicates
const FORBID_DUPLICATES = [
  /^@backstage\/core$/,
  /^@backstage\/core-api$/,
  /^@backstage\/plugin-/,
];

export default async (cmd: Command) => {
  const fix = Boolean(cmd.fix);

  let success = true;

  const lockfilePath = paths.resolveTargetRoot('yarn.lock');
  const lockfile = await Lockfile.load(lockfilePath);
  const result = lockfile.analyze({
    filter: name => INCLUDED.some(pattern => pattern.test(name)),
  });

  logArray(
    result.invalidRanges,
    "The following packages versions are invalid and can't be analyzed:",
    e => `  ${e.name} @ ${e.range}`,
  );

  if (fix) {
    lockfile.replaceVersions(result.newVersions);

    await fs.writeFile(lockfilePath, lockfile.toString(), 'utf8');
  } else {
    const [
      newVersionsForbidden,
      newVersionsAllowed,
    ] = partition(result.newVersions, ({ name }) =>
      FORBID_DUPLICATES.some(pattern => pattern.test(name)),
    );
    if (newVersionsForbidden.length && !fix) {
      success = false;
    }

    logArray(
      newVersionsForbidden,
      'The following packages must be deduplicated, this can be done automatically with --fix',
      e =>
        `  ${e.name} @ ${e.range} bumped from ${e.oldVersion} to ${e.newVersion}`,
    );
    logArray(
      newVersionsAllowed,
      'The following packages can be deduplicated, this can be done automatically with --fix',
      e =>
        `  ${e.name} @ ${e.range} bumped from ${e.oldVersion} to ${e.newVersion}`,
    );
  }

  const [newRangesForbidden, newRangesAllowed] = partition(
    result.newRanges,
    ({ name }) => FORBID_DUPLICATES.some(pattern => pattern.test(name)),
  );
  if (newRangesForbidden.length) {
    success = false;
  }

  logArray(
    newRangesForbidden,
    'The following packages must be deduplicated by updating dependencies in package.json',
    e => `  ${e.name} @ ${e.oldRange} should be changed to ${e.newRange}`,
  );
  logArray(
    newRangesAllowed,
    'The following packages can be deduplicated by updating dependencies in package.json',
    e => `  ${e.name} @ ${e.oldRange} should be changed to ${e.newRange}`,
  );

  if (!success) {
    throw new Error('Failed versioning check');
  }
};

function logArray<T>(arr: T[], header: string, each: (item: T) => void) {
  if (arr.length === 0) {
    return;
  }

  console.log(header);
  console.log();
  for (const e of arr) {
    console.log(each(e));
  }
  console.log();
}
