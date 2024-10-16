import { mergeConfigSchemas } from '@backstage/config-loader';
import { assertError } from '@backstage/errors';
import { JsonObject } from '@backstage/types';

import fs from 'fs-extra';

import { EOL } from 'os';
import {
  dirname,
  relative as relativePath,
  resolve as resolvePath,
  sep,
} from 'path';

type ConfigSchemaPackageEntry = {
  /**
   * The configuration schema itself.
   */
  value: JsonObject;
  /**
   * The relative path that the configuration schema was discovered at.
   */
  path: string;
};

type Item = {
  name?: string;
  parentPath?: string;
  packagePath?: string;
};

/**
 * Filter out Backstage core packages from crawled dependencies based on their package name
 * @param depName Package name to crawl
 * @returns True if package is useful to crawl, false otherwise
 */
const filterPackages = (depName: string) => {
  // reject all core dependencies
  if (depName.startsWith('@backstage/')) {
    // make an exception for Backstage core plugins (used in plugin wrappers) unless they are common to all Backstage instances
    if (depName.startsWith('@backstage/plugin-')) {
      if (
        depName.startsWith('@backstage/plugin-catalog-') ||
        depName.startsWith('@backstage/plugin-permission-') ||
        depName.startsWith('@backstage/plugin-search-') ||
        depName.startsWith('@backstage/plugin-scaffolder-')
      ) {
        return false;
      }
      return true;
    }
    return false;
  } else if (depName === '@janus-idp/cli') {
    // reject CLI schema
    return false;
  }
  // all other packages should be included in the schema
  return true;
};

const req =
  typeof __non_webpack_require__ === 'undefined'
    ? require
    : __non_webpack_require__;

/**
 * This collects all known config schemas across all dependencies of the app.
 * Inspired by https://github.com/backstage/backstage/blob/a957d4654f35fb5ba6cc3450bcdb2634dcbb7724/packages/config-loader/src/schema/collect.ts#L43
 * All unrelated logic removed from ^, only collection code is left
 *
 * @param packageName Package name to collect schema for
 */
async function collectConfigSchemas(
  packageName: string,
): Promise<ConfigSchemaPackageEntry[]> {
  const schemas = new Array<ConfigSchemaPackageEntry>();
  const tsSchemaPaths = new Array<string>();
  const visitedPackageVersions = new Map<string, Set<string>>(); // pkgName: [versions...]

  const currentDir = await fs.realpath(process.cwd());

  async function processItem(item: Item) {
    let pkgPath = item.packagePath;

    if (pkgPath) {
      const pkgExists = await fs.pathExists(pkgPath);
      if (!pkgExists) {
        return;
      }
    } else if (item.name) {
      const { name, parentPath } = item;

      try {
        pkgPath = req.resolve(
          `${name}/package.json`,
          parentPath && {
            paths: [parentPath],
          },
        );
      } catch {
        // We can somewhat safely ignore packages that don't export package.json,
        // as they are likely not part of the Backstage ecosystem anyway.
      }
    }
    if (!pkgPath) {
      return;
    }

    const pkg = await fs.readJson(pkgPath);

    // Ensures that we only process the same version of each package once.
    let versions = visitedPackageVersions.get(pkg.name);
    if (versions?.has(pkg.version)) {
      return;
    }
    if (!versions) {
      versions = new Set();
      visitedPackageVersions.set(pkg.name, versions);
    }
    versions.add(pkg.version);

    const depNames = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
      ...Object.keys(pkg.optionalDependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
    ];

    const hasSchema = 'configSchema' in pkg;
    if (hasSchema) {
      if (typeof pkg.configSchema === 'string') {
        const isJson = pkg.configSchema.endsWith('.json');
        const isDts = pkg.configSchema.endsWith('.d.ts');
        if (!isJson && !isDts) {
          throw new Error(
            `Config schema files must be .json or .d.ts, got ${pkg.configSchema}`,
          );
        }
        if (isDts) {
          tsSchemaPaths.push(
            relativePath(
              currentDir,
              resolvePath(dirname(pkgPath), pkg.configSchema),
            ),
          );
        } else {
          const path = resolvePath(dirname(pkgPath), pkg.configSchema);
          const value = await fs.readJson(path);
          schemas.push({
            value,
            path: relativePath(currentDir, path),
          });
        }
      } else {
        schemas.push({
          value: pkg.configSchema,
          path: relativePath(currentDir, pkgPath),
        });
      }
    }

    await Promise.all(
      depNames
        .filter(filterPackages)
        .map(depName => processItem({ name: depName, parentPath: pkgPath })),
    );
  }

  await processItem({
    name: packageName,
    packagePath: `${currentDir}/package.json`,
  });

  const tsSchemas = await compileTsSchemas(tsSchemaPaths);

  return schemas.concat(tsSchemas);
}

// This handles the support of TypeScript .d.ts config schema declarations.
// We collect all typescript schema definition and compile them all in one go.
// This is much faster than compiling them separately.
// Copy-pasted from: https://github.com/backstage/backstage/blob/a957d4654f35fb5ba6cc3450bcdb2634dcbb7724/packages/config-loader/src/schema/collect.ts#L160
async function compileTsSchemas(paths: string[]) {
  if (paths.length === 0) {
    return [];
  }

  // Lazy loaded, because this brings up all of TypeScript and we don't
  // want that eagerly loaded in tests
  const { getProgramFromFiles, buildGenerator } = await import(
    'typescript-json-schema'
  );

  const program = getProgramFromFiles(paths, {
    incremental: false,
    isolatedModules: true,
    lib: ['ES5'], // Skipping most libs speeds processing up a lot, we just need the primitive types anyway
    noEmit: true,
    noResolve: true,
    skipLibCheck: true, // Skipping lib checks speeds things up
    skipDefaultLibCheck: true,
    strict: true,
    typeRoots: [], // Do not include any additional types
    types: [],
  });

  const tsSchemas = paths.map(path => {
    let value;
    try {
      const generator = buildGenerator(
        program,
        // This enables the use of these tags in TSDoc comments
        {
          required: true,
          validationKeywords: ['visibility', 'deepVisibility', 'deprecated'],
        },
        [path.split(sep).join('/')], // Unix paths are expected for all OSes here
      );

      // All schemas should export a `Config` symbol
      value = generator?.getSchemaForSymbol('Config') as JsonObject | null;

      // This makes sure that no additional symbols are defined in the schema. We don't allow
      // this because they share a global namespace and will be merged together, leading to
      // unpredictable behavior.
      const userSymbols = new Set(generator?.getUserSymbols());
      userSymbols.delete('Config');
      if (userSymbols.size !== 0) {
        const names = Array.from(userSymbols).join("', '");
        throw new Error(
          `Invalid configuration schema in ${path}, additional symbol definitions are not allowed, found '${names}'`,
        );
      }

      // This makes sure that no unsupported types are used in the schema, for example `Record<,>`.
      // The generator will extract these as a schema reference, which will in turn be broken for our usage.
      const reffedDefs = Object.keys(generator?.ReffedDefinitions ?? {});
      if (reffedDefs.length !== 0) {
        const lines = reffedDefs.join(`${EOL}  `);
        throw new Error(
          `Invalid configuration schema in ${path}, the following definitions are not supported:${EOL}${EOL}  ${lines}`,
        );
      }
    } catch (error) {
      assertError(error);
      if (error.message !== 'type Config not found') {
        throw error;
      }
    }

    if (!value) {
      throw new Error(`Invalid schema in ${path}, missing Config export`);
    }
    return { path, value };
  });

  return tsSchemas;
}

/**
 * Collect JSON schema for given plugin package (without core Backstage schema)
 * @param packageName Name of the package for which it is needed to collect schema
 * @returns JSON Schema object
 */
export const getConfigSchema = async (packageName: string) => {
  const schemas = await collectConfigSchemas(packageName);

  return mergeConfigSchemas((schemas as JsonObject[]).map(_ => _.value as any));
};
