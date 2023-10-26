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

import { PackageRoleInfo } from '@backstage/cli-node';

import { OptionValues } from 'commander';
import fs from 'fs-extra';

import { buildScalprumPlugin } from '../../lib/builder/buildScalprumPlugin';
import { paths } from '../../lib/paths';

export async function frontend(
  _: PackageRoleInfo,
  __: OptionValues,
): Promise<void> {
  const { name, version, scalprum } = await fs.readJson(
    paths.resolveTarget('package.json'),
  );
  if (scalprum === undefined) {
    throw new Error(
      `Package doesn't seem to support dynamic loading. It should have a 'scalprum' key in 'package.json' containing the dynamic loading entrypoints.`,
    );
  }

  await fs.remove(paths.resolveTarget('dist-scalprum'));

  await buildScalprumPlugin({
    writeStats: false,
    configPaths: [],
    targetDir: paths.targetDir,
    pluginMetadata: {
      ...scalprum,
      version,
    },
    fromPackage: name,
  });
}
