/*
 * Copyright 2024 The Janus IDP Authors
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

import { mockServices } from '@backstage/backend-test-utils';

import { getCatalogUrl } from './catalogUtils';

describe('catalogUtils', () => {
  it('should return a catalog url if no main branch is set', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    expect(getCatalogUrl(mockServices.rootConfig(), repoUrl)).toBe(
      `${repoUrl}/blob/main/catalog-info.yaml`,
    );
  });

  it('should return appropriate catalog url for both repo and default branch', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    const defaultBranch = 'dev';
    expect(
      getCatalogUrl(mockServices.rootConfig(), repoUrl, defaultBranch),
    ).toBe(`${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`);
  });

  it('should return appropriate catalog url for both repo and default branch with default catalog-info YAML', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    const defaultBranch = 'dev';
    expect(
      getCatalogUrl(mockServices.rootConfig(), repoUrl, defaultBranch),
    ).toBe(`${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`);
  });

  it('should return appropriate catalog url for both repo and default branch with custom catalog-info name in config', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    const defaultBranch = 'dev';
    expect(
      getCatalogUrl(
        mockServices.rootConfig({
          data: {
            catalog: {
              import: {
                entityFilename: 'my-catalog-info.yaml',
              },
            },
          },
        }),
        repoUrl,
        defaultBranch,
      ),
    ).toBe(`${repoUrl}/blob/${defaultBranch}/my-catalog-info.yaml`);
  });
});
