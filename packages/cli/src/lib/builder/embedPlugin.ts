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

import { BackstagePackageJson } from '@backstage/cli-node';

import fs from 'fs-extra';
import { InputOptions, Plugin } from 'rollup';
import { createFilter } from 'rollup-pluginutils';

import path from 'path';

import { dependencies } from '../../commands/install/steps';

type EmbedModulesOptions = {
  filter: {
    include: Array<string | RegExp> | string | RegExp | null;
    exclude?: Array<string | RegExp> | string | RegExp | null;
  };
  addDependency(
    embeddedModule: string,
    dependencyName: string,
    dependencyVersion: string,
  ): void;
};

/**
 * This rollup plugin embeds given modules, considering them non external.
 * It also calls the addDependency() callback for every dependency of embedded modules,
 * in order to give the opportunity to add them in a modified package.json file
 */
export function embedModules(options: EmbedModulesOptions): Plugin {
  const filter = createFilter(options.filter.include, options.filter.exclude, {
    resolve: false,
  });

  const embedded = new Set<string>();
  return {
    name: 'embed-modules',
    async buildEnd(err) {
      if (err !== undefined) {
        return;
      }
      for (const e of embedded) {
        if (e.endsWith('/alpha')) {
          continue;
        }
        const mod = await this.resolve(
          path.join(e, 'package.json'),
          undefined,
          { skipSelf: true },
        );
        if (mod === null) {
          continue;
        }
        const pkgContent = await fs.readFile(mod.id, 'utf8');
        const pkg = JSON.parse(pkgContent) as BackstagePackageJson;
        if (dependencies === undefined) {
          continue;
        }
        for (const dep in pkg.dependencies) {
          if (!Object.prototype.hasOwnProperty.call(pkg.dependencies, dep)) {
            continue;
          }
          options.addDependency(e, dep, pkg.dependencies[dep]);
        }
      }
    },
    options(inputOptions) {
      const origExternal = inputOptions.external;

      // We decorate any existing `external` option with our own way of determining
      // if a module should be external.
      const external: InputOptions['external'] = (id, importer, isResolved) => {
        // The piece that we're adding
        if (filter(id) && importer !== undefined) {
          if (!embedded.has(id)) {
            embedded.add(id);
            console.log(`Embedding module ${id}`);
          }
          return false;
        }

        // Call to inner external option
        if (typeof origExternal === 'function') {
          return origExternal(id, importer, isResolved);
        }

        if (Array.isArray(origExternal)) {
          return origExternal.includes(id);
        }

        return true;
      };

      return { ...inputOptions, external };
    },
  };
}
