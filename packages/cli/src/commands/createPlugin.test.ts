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

import fs from 'fs';
import path from 'path';
import os from 'os';
import del from 'del';
import {
  createFileFromTemplate,
  createFromTemplateDir,
  createTemporaryPluginFolder,
  movePlugin,
} from './createPlugin';

describe('createPlugin', () => {
  describe('createPluginFolder', () => {
    it('should create a temporary plugin directory in the correct place', () => {
      const id = 'testPlugin';
      const tempDir = path.join(os.tmpdir(), id);
      try {
        createTemporaryPluginFolder(tempDir);
        expect(fs.existsSync(tempDir)).toBe(true);
        expect(tempDir).toMatch(id);
      } finally {
        del.sync(tempDir, { force: true });
      }
    });

    it('should not create a temporary plugin directory if it already exists', () => {
      const id = 'testPlugin';
      const tempDir = path.join(os.tmpdir(), id);
      try {
        createTemporaryPluginFolder(tempDir);
        expect(fs.existsSync(tempDir)).toBe(true);
        expect(() => createTemporaryPluginFolder(tempDir)).toThrowError(
          /Failed to create temporary plugin directory/,
        );
      } finally {
        del.sync(tempDir, { force: true });
      }
    });
  });

  describe('createFileFromTemplate', () => {
    it('should generate a valid output with inserted values', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
      try {
        const sourceData =
          '{"name": "@spotify-backstage/{{id}}", "version": "{{version}}"}';
        const targetData =
          '{"name": "@spotify-backstage/foo", "version": "0.0.0"}';
        const sourcePath = path.join(tempDir, 'in.hbs');
        const targetPath = path.join(tempDir, 'out.json');
        fs.writeFileSync(sourcePath, sourceData);

        createFileFromTemplate(sourcePath, targetPath, { id: 'foo' }, '0.0.0');

        expect(fs.existsSync(targetPath)).toBe(true);
        expect(fs.readFileSync(targetPath).toString()).toBe(targetData);
      } finally {
        del.sync(tempDir, { force: true });
      }
    });
  });

  describe('createFromTemplateDir', () => {
    it('should create sub-directories and files', async () => {
      const templateRootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
      const templateSubDir = fs.mkdtempSync(path.join(templateRootDir, 'sub-'));
      fs.writeFileSync(path.join(templateSubDir, 'test.txt'), 'testing');

      const destinationRootDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'test-'),
      );
      const subDir = path.join(
        destinationRootDir,
        path.basename(templateSubDir),
      );
      const testFile = path.join(
        destinationRootDir,
        path.basename(templateSubDir),
        'test.txt',
      );
      try {
        await createFromTemplateDir(
          templateRootDir,
          destinationRootDir,
          {},
          '0.0.0',
        );
        expect(fs.existsSync(subDir)).toBe(true);
        expect(fs.existsSync(testFile)).toBe(true);
      } finally {
        await del(templateRootDir, { force: true });
        await del(destinationRootDir, { force: true });
      }
    });
  });

  describe('movePlugin', () => {
    it('should move the temporary plugin directory to its final place', () => {
      const id = 'testPlugin';
      const tempDir = path.join(os.tmpdir(), id);
      const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
      const pluginDir = path.join(rootDir, 'plugins', id);
      try {
        createTemporaryPluginFolder(tempDir);
        movePlugin(tempDir, pluginDir, id);
        expect(fs.existsSync(pluginDir)).toBe(true);
        expect(pluginDir).toMatch(`/plugins\/${id}`);
      } finally {
        del.sync(tempDir, { force: true });
        del.sync(rootDir, { force: true });
      }
    });
  });
});
