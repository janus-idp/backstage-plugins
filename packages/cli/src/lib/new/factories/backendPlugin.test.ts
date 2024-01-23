/*
 * Copyright 2021 The Backstage Authors
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
import mockFs from 'mock-fs';

import { resolve as resolvePath, sep } from 'path';

import { paths } from '../../paths';
import { Task } from '../../tasks';
import { FactoryRegistry } from '../FactoryRegistry';
import { backendPlugin } from './backendPlugin';
import { createMockOutputStream, mockPaths } from './common/testUtils';

describe('backendPlugin factory', () => {
  beforeEach(() => {
    mockPaths({
      targetRoot: '/root',
    });
  });

  afterEach(() => {
    mockFs.restore();
    jest.resetAllMocks();
  });

  it('should create a backend plugin', async () => {
    mockFs({
      '/root': {
        packages: {
          backend: {
            'package.json': JSON.stringify({}),
          },
        },
        plugins: mockFs.directory(),
      },
      [paths.resolveOwn('templates')]: mockFs.load(
        paths.resolveOwn('templates'),
      ),
    });

    const options = await FactoryRegistry.populateOptions(backendPlugin, {
      id: 'test',
    });

    let modified = false;

    const [output, mockStream] = createMockOutputStream();
    jest.spyOn(process, 'stderr', 'get').mockReturnValue(mockStream);
    jest.spyOn(Task, 'forCommand').mockResolvedValue();

    await backendPlugin.create(options, {
      private: true,
      isMonoRepo: true,
      defaultVersion: '1.0.0',
      markAsModified: () => {
        modified = true;
      },
      createTemporaryDirectory: () => fs.mkdtemp('test'),
    });

    expect(modified).toBe(true);

    expect(output).toEqual([
      '',
      'Creating backend plugin @janus-idp/backstage-plugin-test-backend',
      'Checking Prerequisites:',
      `availability  plugins${sep}test-backend`,
      'creating      temp dir',
      'Executing Template:',
      'copying       .eslintrc.js',
      'templating    README.md.hbs',
      'copying       app-config.janus-idp.yaml',
      'copying       config.d.ts',
      'templating    package.json.hbs',
      'templating    tsconfig.json.hbs',
      'templating    turbo.json.hbs',
      'templating    index.ts.hbs',
      'templating    run.ts.hbs',
      'copying       setupTests.ts',
      'templating    alpha.ts.hbs',
      'templating    index.ts.hbs',
      'copying       router.test.ts',
      'templating    router.ts.hbs',
      'templating    standaloneServer.ts.hbs',
      'Installing:',
      `moving        plugins${sep}test-backend`,
      'backend       adding dependency',
    ]);

    await expect(
      fs.readJson('/root/packages/backend/package.json'),
    ).resolves.toEqual({
      dependencies: {
        '@janus-idp/backstage-plugin-test-backend': '^1.0.0',
      },
    });
    const standaloneServerFile = await fs.readFile(
      '/root/plugins/test-backend/src/service/standaloneServer.ts',
      'utf-8',
    );

    expect(standaloneServerFile).toContain(
      `const logger = options.logger.child({ service: 'test-backend' });`,
    );
    expect(standaloneServerFile).toContain(`.addRouter('/test', router);`);

    expect(Task.forCommand).toHaveBeenCalledTimes(2);
    expect(Task.forCommand).toHaveBeenCalledWith('yarn install', {
      cwd: resolvePath('/root/plugins/test-backend'),
      optional: true,
    });
    expect(Task.forCommand).toHaveBeenCalledWith('yarn lint --fix', {
      cwd: resolvePath('/root/plugins/test-backend'),
      optional: true,
    });
  });
});
