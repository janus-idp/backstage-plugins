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

import * as fs from 'fs-extra';
import * as path from 'path';
import * as differ from 'diff';
import { PATCH_FOLDER } from '../files';
import { findPaths } from '@backstage/cli-common';

/* eslint-disable-next-line no-restricted-syntax */
const { targetRoot } = findPaths(__dirname);

export const patch = async (patchFile: string) => {
  const patchContent = await fs.readFile(
    path.join(PATCH_FOLDER, patchFile),
    'utf8',
  );
  const targetName = patchContent.split('\n')[0].replace('--- a', '');
  const targetFile = path.join(targetRoot, targetName);
  const oldContent = await fs.readFile(targetFile, 'utf8');
  const newContent = differ.applyPatch(oldContent, patchContent);
  if (!newContent) {
    throw new Error(
      `Patch ${patchFile} was not applied correctly.
       Did you change ${targetName} manually before running this command?`,
    );
  }

  return await fs.writeFile(targetFile, newContent, 'utf8');
};
