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

const os = require('os');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const killTree = require('tree-kill');
const { resolve: resolvePath, join: joinPath } = require('path');
const Browser = require('zombie');
const {
  spawnPiped,
  runPlain,
  handleError,
  waitForPageWithText,
  waitFor,
  waitForExit,
  print,
} = require('./helpers');
const pgtools = require('pgtools');

async function main() {
  const rootDir = await fs.mkdtemp(resolvePath(os.tmpdir(), 'backstage-e2e-'));
  print(`CLI E2E test root: ${rootDir}\n`);

  print('Building dist workspace');
  const workspaceDir = await buildDistWorkspace('workspace', rootDir);

  const isPostgres = Boolean(process.env.POSTGRES_USER);
  print('Creating a Backstage App');
  const appDir = await createApp('test-app', isPostgres, workspaceDir, rootDir);

  print('Creating a Backstage Plugin');
  const pluginName = await createPlugin('test-plugin', appDir);

  print('Starting the app');
  await testAppServe(pluginName, appDir);

  print('Testing the backend startup');
  await testBackendStart(appDir, isPostgres);

  print('All tests successful, removing test dir');
  await fs.remove(rootDir);
}

/**
 * Builds a dist workspace that contains the cli and core packages
 */
async function buildDistWorkspace(workspaceName, rootDir) {
  const workspaceDir = resolvePath(rootDir, workspaceName);
  await fs.ensureDir(workspaceDir);

  print(`Preparing workspace`);
  await runPlain([
    'yarn',
    'backstage-cli',
    'build-workspace',
    workspaceDir,
    '@backstage/cli',
    '@backstage/create-app',
    '@backstage/core',
    '@backstage/dev-utils',
    '@backstage/test-utils',
    // We don't use the backend itself, but want all of its dependencies
    'example-backend',
  ]);

  print('Pinning yarn version in workspace');
  await pinYarnVersion(workspaceDir);

  print('Installing workspace dependencies');
  await runPlain(['yarn', 'install', '--production', '--frozen-lockfile'], {
    cwd: workspaceDir,
  });

  return workspaceDir;
}

/**
 * Pin the yarn version in a directory to the one we're using in the Backstage repo
 */
async function pinYarnVersion(dir) {
  const repoRoot = resolvePath(__dirname, '../../..');

  const yarnRc = await fs.readFile(resolvePath(repoRoot, '.yarnrc'), 'utf8');
  const yarnRcLines = yarnRc.split('\n');
  const yarnPathLine = yarnRcLines.find(line => line.startsWith('yarn-path'));
  const [, localYarnPath] = yarnPathLine.match(/"(.*)"/);
  const yarnPath = resolvePath(repoRoot, localYarnPath);

  await fs.writeFile(resolvePath(dir, '.yarnrc'), `yarn-path "${yarnPath}"\n`);
}

/**
 * Creates a new app inside rootDir called test-app, using packages from the workspaceDir
 */
async function createApp(appName, isPostgres, workspaceDir, rootDir) {
  const child = spawnPiped(
    [
      'node',
      resolvePath(workspaceDir, 'packages/create-app/bin/backstage-create-app'),
      '--skip-install',
    ],
    {
      cwd: rootDir,
    },
  );

  try {
    let stdout = '';
    child.stdout.on('data', data => {
      stdout = stdout + data.toString('utf8');
    });

    await waitFor(() => stdout.includes('Enter a name for the app'));
    child.stdin.write(`${appName}\n`);

    await waitFor(() => stdout.includes('Select database for the backend'));

    if (!isPostgres) {
      // Simulate down arrow press
      child.stdin.write(`\u001B\u005B\u0042`);
    }
    child.stdin.write(`\n`);

    print('Waiting for app create script to be done');
    await waitForExit(child);

    const appDir = resolvePath(rootDir, appName);

    print('Rewriting module resolutions of app to use workspace packages');
    await overrideModuleResolutions(appDir, workspaceDir);

    print('Pinning yarn version and registry in app');
    await pinYarnVersion(appDir);
    await fs.writeFile(
      resolvePath(appDir, '.npmrc'),
      'registry=https://registry.npmjs.org/\n',
    );

    print('Test app created');

    for (const cmd of ['install', 'tsc', 'build', 'lint:all', 'test:all']) {
      print(`Running 'yarn ${cmd}' in newly created app`);
      await runPlain(['yarn', cmd], { cwd: appDir });
    }

    print(`Running 'yarn test:e2e:ci' in newly created app`);
    await runPlain(['yarn', 'test:e2e:ci'], {
      cwd: resolvePath(appDir, 'packages', 'app'),
      env: {
        ...process.env,
        APP_CONFIG_app_baseUrl: '"http://localhost:3001"',
      },
    });

    return appDir;
  } finally {
    child.kill();
  }
}

/**
 * This points dependency resolutions into the workspace for each package that is present there
 */
async function overrideModuleResolutions(appDir, workspaceDir) {
  const pkgJsonPath = resolvePath(appDir, 'package.json');
  const pkgJson = await fs.readJson(pkgJsonPath);

  pkgJson.resolutions = pkgJson.resolutions || {};
  pkgJson.dependencies = pkgJson.dependencies || {};

  for (const dir of ['packages', 'plugins']) {
    const packageNames = await fs.readdir(resolvePath(workspaceDir, dir));
    for (const pkgDir of packageNames) {
      const pkgPath = joinPath('..', 'workspace', dir, pkgDir);
      const { name } = await fs.readJson(
        resolvePath(workspaceDir, dir, pkgDir, 'package.json'),
      );

      pkgJson.dependencies[name] = `file:${pkgPath}`;
      pkgJson.resolutions[name] = `file:${pkgPath}`;
      delete pkgJson.devDependencies[name];
    }
  }
  fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
}

/**
 * Uses create-plugin command to create a new plugin in the app
 */
async function createPlugin(pluginName, appDir) {
  const child = spawnPiped(['yarn', 'create-plugin'], {
    cwd: appDir,
  });

  try {
    let stdout = '';
    child.stdout.on('data', data => {
      stdout = stdout + data.toString('utf8');
    });

    await waitFor(() => stdout.includes('Enter an ID for the plugin'));
    child.stdin.write(`${pluginName}\n`);

    // await waitFor(() => stdout.includes('Enter the owner(s) of the plugin'));
    // child.stdin.write('@someuser\n');

    print('Waiting for plugin create script to be done');
    await waitForExit(child);

    const pluginDir = resolvePath(appDir, 'plugins', pluginName);
    for (const cmd of [['tsc'], ['lint'], ['test', '--no-watch']]) {
      print(`Running 'yarn ${cmd.join(' ')}' in newly created plugin`);
      await runPlain(['yarn', ...cmd], { cwd: pluginDir });
    }

    return pluginName;
  } finally {
    child.kill();
  }
}

/**
 * Start serving the newly created app and make sure that the create plugin is rendering correctly
 */
async function testAppServe(pluginName, appDir) {
  const startApp = spawnPiped(['yarn', 'start'], {
    cwd: appDir,
  });
  Browser.localhost('localhost', 3000);

  let successful = false;
  try {
    const browser = new Browser();

    await waitForPageWithText(browser, '/', 'Welcome to Backstage');
    await waitForPageWithText(
      browser,
      `/${pluginName}`,
      `Welcome to ${pluginName}!`,
    );

    print('Both App and Plugin loaded correctly');
    successful = true;
  } catch (error) {
    throw new Error(`App serve test failed, ${error}`);
  } finally {
    // Kill entire process group, otherwise we'll end up with hanging serve processes
    killTree(startApp.pid);
  }

  try {
    await waitForExit(startApp);
  } catch (error) {
    if (!successful) {
      throw error;
    }
  }
}

/** Creates PG databases (drops if exists before) */
async function createDB(database) {
  const config = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };

  try {
    await pgtools.dropdb({ config }, database);
  } catch (_) {
    /* do nothing*/
  }
  return pgtools.createdb(config, database);
}

/**
 * Start serving the newly created backend and make sure that all db migrations works correctly
 */
async function testBackendStart(appDir, isPostgres) {
  if (isPostgres) {
    print('Creating DBs');
    await Promise.all(
      [
        'catalog',
        'scaffolder',
        'auth',
        'identity',
        'proxy',
        'techdocs',
      ].map(name => createDB(`backstage_plugin_${name}`)),
    );
    print('Created DBs');
  }

  const child = spawnPiped(['yarn', 'workspace', 'backend', 'start'], {
    cwd: appDir,
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', data => {
    stdout = stdout + data.toString('utf8');
  });
  child.stderr.on('data', data => {
    stderr = stderr + data.toString('utf8');
  });
  let successful = false;

  try {
    await waitFor(() => stdout.includes('Listening on ') || stderr !== '');
    if (stderr !== '') {
      // Skipping the whole block
      throw new Error(stderr);
    }

    print('Try to fetch entities from the backend');
    // Try fetch entities, should be ok
    await fetch('http://localhost:7000/catalog/entities').then(res =>
      res.json(),
    );
    print('Entities fetched successfully');
    successful = true;
  } catch (error) {
    throw new Error(`Backend failed to startup: ${error}`);
  } finally {
    print('Stopping the child process');
    // Kill entire process group, otherwise we'll end up with hanging serve processes
    killTree(child.pid);
  }

  try {
    await waitForExit(child);
  } catch (error) {
    if (!successful) {
      throw new Error(`Backend failed to startup: ${stderr}`);
    }
    print('Backend startup test finished successfully');
  }
}

process.on('unhandledRejection', handleError);
main(process.argv.slice(2)).catch(handleError);
