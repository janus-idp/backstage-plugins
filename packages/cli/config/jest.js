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

const fs = require('fs-extra');
const path = require('path');

async function getConfig() {
  // If the package has it's own jest config, we use that instead.
  if (await fs.pathExists('jest.config.js')) {
    return require(path.resolve('jest.config.js'));
  } else if (await fs.pathExists('jest.config.ts')) {
    return require(path.resolve('jest.config.ts'));
  }

  const moduleNameMapper = {
    '\\.(css|less|scss|sss|styl)$': require.resolve('jest-css-modules'),
  };

  // Only point to src/ if we're not in CI, there we just build packages first anyway
  if (!process.env.CI) {
    const LernaProject = require('@lerna/project');
    const project = new LernaProject(path.resolve('.'));
    const packages = await project.getPackages();

    // To avoid having to build all deps inside the monorepo before running tests,
    // we point directory to src/ where applicable.
    // For example, @backstage/core = <repo-root>/packages/core/src/index.ts is added to moduleNameMapper
    for (const pkg of packages) {
      const mainSrc = pkg.get('main:src');
      if (mainSrc) {
        moduleNameMapper[`^${pkg.name}$`] = path.resolve(pkg.location, mainSrc);
      }
    }
  }

  const options = {
    rootDir: path.resolve('src'),
    coverageDirectory: path.resolve('coverage'),
    collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!**/*.d.ts'],
    moduleNameMapper,

    // We build .esm.js files with plugin:build, so to be able to load these in tests they need to be transformed
    // TODO: jest is working on module support, it's possible that we can remove this in the future
    transform: {
      '\\.esm\\.js$': require.resolve('jest-esm-transformer'),
      '\\.(js|jsx|ts|tsx)': require.resolve('ts-jest'),
    },

    // Default behaviour is to not apply transforms for node_modules, but we still want
    // to apply the esm-transformer to .esm.js files, since that's what we use in backstage packages.
    transformIgnorePatterns: ['/node_modules/(?!.*\\.esm\\.js$)'],
  };

  // Use src/setupTests.ts as the default location for configuring test env
  if (fs.existsSync('src/setupTests.ts')) {
    options.setupFilesAfterEnv = ['<rootDir>/setupTests.ts'];
  }

  return {
    ...options,

    // If the package has a jest object in package.json we merge that config in. This is the recommended
    // location for configuring tests.
    ...require(path.resolve('package.json')).jest,
  };
}

module.exports = getConfig();
