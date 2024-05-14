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

// test with ./packages/cli/bin/janus-cli package metadata --help

// @ts-ignore
import Codeowners from 'codeowners';
import { OptionValues } from 'commander';
import gitconfig from 'gitconfiglocal';

import * as fs from 'fs';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const pGitconfig = promisify(gitconfig);

export async function command(opts: OptionValues): Promise<void> {
  const config = await pGitconfig(process.cwd());
  updatePackageMetadata(opts, config?.remote?.origin?.url);
}

interface Repository {
  type: string;
  url: string;
  directory: string;
}

interface PackageJson {
  name: string;
  version: string;
  main: string;
  types: string;
  license: string;
  author: string;
  configschema: string;

  homepage: URL;
  bugs: URL;

  sideEffects: boolean;

  publishConfig: {};
  backstage: {
    role: string;
    'supported-versions': string;
  };
  scripts: {};
  dependencies: {};
  peerDependencies: {};
  devDependencies: {};
  scalprum: {};
  repository: Repository;

  files: string[];
  maintainers: string[];
  keywords: string[];
}

const path = {
  /**
   * @method resolveRelativeFromAbsolute resolves a relative path from an absolute path
   * @param {string} DotDotPath relative path
   * @returns {string} resolved absolutePath
   */
  resolveRelativeFromAbsolute(DotDotPath: string): string[] {
    const pathsArray = DotDotPath.replaceAll(/[/|\\]/g, '/').split('/');
    const map = pathsArray.reduce(
      (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
      new Map(),
    );
    // console.log(` @ ${DotDotPath} => ${pathsArray} (${map.get("..")} backs)`)
    const rootDir = pathsArray.slice(0, -(map.get('..') * 2)).join('/');
    // console.log(` @ root dir: ${rootdir}`)
    const relativeDir = process.cwd().replaceAll(`${rootDir}/`, '');
    return [rootDir, relativeDir];
  },
};

function findCodeowners(element: string) {
  if (fs.existsSync(`${element}/.github/CODEOWNERS`)) {
    return element; // found the root dir
  }
  return findCodeowners(`${element}/..`);
}

function separateKeywords(array: string[]): {
  keywords: string[];
  lifecycle?: string;
  support?: string;
} {
  return array.reduce(
    (prev, keyword) => {
      // separate lifecycle keyword
      if (keyword.startsWith('lifecycle:')) {
        return { ...prev, lifecycle: keyword };
      }

      // separate support keyword
      if (keyword.startsWith('support:')) {
        return { ...prev, support: keyword };
      }

      // keep the remaining keywords together
      prev.keywords.push(keyword);
      return prev;
    },
    { keywords: [] } as {
      keywords: string[];
      lifecycle?: string;
      support?: string;
    },
  );
}

export function updatePackageMetadata(
  opts: OptionValues,
  gitconfigRemoteOriginUrl: string,
) {
  // load the package.json from the specified (or current) folder
  const workingDir = `${process.cwd()}/${opts.dir}`;
  console.log(`Updating ${workingDir} / package.json`);

  // compute the root dir and relative path to the current dir
  const [rootDir, relativePath] = opts.dir
    ? [process.cwd(), opts.dir]
    : path.resolveRelativeFromAbsolute(findCodeowners(`${process.cwd()}`));
  // console.log(` @ rootdir = ${rootdir}, relative_path = ${relative_path}`)

  const packageJSONPath = join(workingDir, 'package.json');
  const packageJSON = JSON.parse(
    readFileSync(packageJSONPath, 'utf8'),
  ) as PackageJson;

  /* now let's change some values */

  // 1. add backstage version matching the current value of backstage.json in this repo
  if (fs.existsSync(join(rootDir, '/backstage.json'))) {
    packageJSON.backstage['supported-versions'] = JSON.parse(
      readFileSync(join(rootDir, '/backstage.json'), 'utf8'),
    ).version;
  }

  // 2. set up repository values and the current path as repo.directory
  const repo = {} as Repository;
  repo.type = 'git';
  repo.url = gitconfigRemoteOriginUrl
    .toString()
    .replaceAll('git@github.com:', 'https://github.com/')
    .replaceAll('.git', '')
    .trim();
  repo.directory = relativePath;
  packageJSON.repository = repo;

  // 3. load owners from CODEOWNERS file, using this package.json's repository.directory field to compute maintainer groups
  let owners: string[] = [];
  if (packageJSON.repository.directory) {
    const repos = new Codeowners();
    owners = repos.getOwner(relativePath);
  } else {
    console.log(
      ` ! Could not load .github/CODEOWNERS file, so cannot update maintainers in package.json`,
    );
  }
  packageJSON.maintainers = owners;

  // 4. set some hardcoded values based on commandline flags
  packageJSON.author = opts.author;
  packageJSON.license = opts.license;
  packageJSON.homepage = new URL(opts.homepage);
  packageJSON.bugs = new URL(opts.bugs);

  // initialize empty string array if not already present
  if (!packageJSON.keywords) {
    packageJSON.keywords = [];
  }

  // if already have keywords, replace lifecycle and support with new values (if defined)
  // we can only have ONE lifecycle and one support keyword, so remove replace any existing values
  const {
    keywords: oldKeywords,
    lifecycle: oldLifecycle,
    support: oldSupport,
  } = separateKeywords(packageJSON.keywords);

  const {
    keywords: optsKeywords,
    lifecycle: optsLifecycle,
    support: optsSupport,
  } = separateKeywords(opts.keywords.split(','));

  const newKeywords = oldKeywords.concat(optsKeywords);

  // if there is a lifecycle keyword, push to the beginning of the array
  if (oldLifecycle || optsLifecycle) {
    newKeywords.unshift(optsLifecycle ?? oldLifecycle ?? '');
  }

  // if there is a support keyword, push to the beginning of the array
  if (oldSupport || optsSupport) {
    newKeywords.unshift(optsSupport ?? oldSupport ?? '');
  }

  // dedupe new keywords
  packageJSON.keywords = Array.from(new Set(newKeywords));

  // write changes to file
  writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2), 'utf8');
}
