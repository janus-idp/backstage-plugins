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

import { OptionValues } from 'commander';
import gitconfig from 'gitconfiglocal';
import _ from 'lodash';

import * as fs from 'fs';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const pGitconfig = promisify(gitconfig);

export async function command(opts: OptionValues): Promise<void> {
  const config = await pGitconfig(process.cwd());
  const gitconfigremoteoriginurl =
    config.remote && config.remote.origin && config.remote.origin.url;
  updatePackageMetadata(opts, gitconfigremoteoriginurl);
}

interface Repository {
  type: string;
  url: string;
  directory: string;
}

interface packageJSON {
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
   * @param {String} DotDotPath relative path
   * @returns {String} resolved absolutePath
   */
  resolveRelativeFromAbsolute(DotDotPath: String) {
    const pathsArray = DotDotPath.replaceAll(/[\/|\\]/g, '/').split('/');
    const map = pathsArray.reduce(
      (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
      new Map(),
    );
    // console.log(` @ ${DotDotPath} => ${pathsArray} (${map.get("..")} backs)`)
    const rootdir = pathsArray.slice(0, -(map.get('..') * 2)).join('/');
    // console.log(` @ root dir: ${rootdir}`)
    const relativeDir = process.cwd().replaceAll(`${rootdir}/`, '');
    return [rootdir, relativeDir];
  },
};

function findCodeowners(element: String) {
  if (fs.existsSync(`${element}/.github/CODEOWNERS`)) {
    return element; // found the root dir
  }
  return findCodeowners(`${element}/..`);
}

export function updatePackageMetadata(
  opts: OptionValues,
  gitconfigremoteoriginurl: string,
) {
  // load the package.json from the specified (or current) folder
  const workingDir = `${process.cwd()}/${opts.dir}`;
  console.log(`Updating ${workingDir} / package.json`);

  // compute the root dir and relative path to the current dir
  const [rootdir, relative_path] = opts.dir
    ? [process.cwd(), opts.dir]
    : path.resolveRelativeFromAbsolute(findCodeowners(`${process.cwd()}`));
  // console.log(` @ rootdir = ${rootdir}, relative_path = ${relative_path}`)

  const packageJSONPath = join(workingDir, 'package.json');
  const packageJSON = JSON.parse(
    readFileSync(packageJSONPath, 'utf8'),
  ) as packageJSON;

  /* now let's change some values */

  // 1. add backstage version matching the current value of backstage.json in this repo
  if (fs.existsSync(join(rootdir, '/backstage.json'))) {
    packageJSON.backstage['supported-versions'] = JSON.parse(
      readFileSync(join(rootdir, '/backstage.json'), 'utf8'),
    ).version;
    // console.log(packageJSON.backstage)
  }

  // 2. set up repository values and the current path as repo.directory
  const repo = {} as Repository;
  repo.type = 'git';
  repo.url = gitconfigremoteoriginurl
    .toString()
    .replaceAll('git@github.com:', 'https://github.com/')
    .replaceAll('.git', '')
    .trim();
  repo.directory = relative_path;
  packageJSON.repository = repo;

  // 3. load owners from CODEOWNERS file, using this package.json's repository.directory field to compute maintainer groups
  let owners = [];
  if (packageJSON.repository.directory) {
    const Codeowners = require('codeowners');
    const repos = new Codeowners();
    owners = repos.getOwner(relative_path);
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

  // eslint-disable-next-line prefer-const
  let newKeywords = opts.keywords.split(',');
  // if already have keywords, replace lifecycle and support with new values (if defined)
  if (packageJSON.keywords.length > 0) {
    for (let i = 0; i < packageJSON.keywords.length; i++) {
      // can only have ONE lifecycle and one support keyword, so remove replace any existing values
      if (
        packageJSON.keywords[i].startsWith('lifecycle:') ||
        packageJSON.keywords[i].startsWith('support:')
      ) {
        for (let j = 0; j < newKeywords.length; j++) {
          if (
            newKeywords[j].startsWith('lifecycle:') ||
            newKeywords[j].startsWith('support:')
          ) {
            // replace existing; remove from array
            packageJSON.keywords[i] = newKeywords[j];
            newKeywords.splice(j, 1);
          }
        }
      }
    }
  }
  // add in the remaining keywords + dedupe
  for (let j = 0; j < newKeywords.length; j++) {
    packageJSON.keywords.push(newKeywords[j]);
  }
  packageJSON.keywords = _.uniq(packageJSON.keywords);

  /* all done! */

  // write changes to file
  writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2), 'utf8');
}
