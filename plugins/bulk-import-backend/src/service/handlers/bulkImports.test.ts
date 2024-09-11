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

import { getVoidLogger } from '@backstage/backend-common';
import {
  AuthService,
  BackstageCredentials,
  BackstagePrincipalTypes,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';

import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../../helpers';
import { GithubApiService } from '../githubApiService';
import { deleteImportByRepo } from './bulkImports';

const mockDiscovery = {
  getBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
  getExternalBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
};

const config = new ConfigReader({
  app: {
    baseUrl: 'https://my-backstage-app.example.com',
  },
  integrations: {
    github: [
      {
        host: 'github.com',
        apps: [
          {
            appId: 1,
            privateKey: 'privateKey',
            webhookSecret: '123',
            clientId: 'CLIENT_ID',
            clientSecret: 'CLIENT_SECRET',
          },
        ],
        token: 'hardcoded_token',
      },
    ],
  },
});

describe('bulkimports.ts tests', () => {
  let logger: Logger;
  let mockAuth: AuthService;
  let mockCatalogClient: CatalogClient;
  let mockCatalogInfoGenerator: CatalogInfoGenerator;
  let mockGithubApiService: GithubApiService;

  beforeAll(() => {
    logger = getVoidLogger();
    mockAuth = {
      isPrincipal<TType extends keyof BackstagePrincipalTypes>(
        _credentials: BackstageCredentials,
        _type: TType,
      ): _credentials is BackstageCredentials<BackstagePrincipalTypes[TType]> {
        return false;
      },
      getPluginRequestToken: () =>
        Promise.resolve({ token: 'ey123.abc.xyzzz' }),
      authenticate: jest.fn(),
      getNoneCredentials: jest.fn(),
      getOwnServiceCredentials: jest.fn().mockResolvedValue({
        principal: {
          subject: 'my-sub',
        },
      }),
      getLimitedUserToken: jest.fn(),
      listPublicServiceKeys: jest.fn(),
    };
    mockCatalogClient = {
      getEntitiesByRefs: jest.fn(),
      validateEntity: jest.fn(),
      addLocation: jest.fn(),
      queryEntities: jest.fn(),
    } as unknown as CatalogClient;
    mockCatalogInfoGenerator = new CatalogInfoGenerator(
      logger,
      mockDiscovery,
      mockAuth,
      mockCatalogClient,
    );
    mockGithubApiService = new GithubApiService(logger, config);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('deleteImportByRepo', () => {
    it('should not try to delete PR is there is no open import PR, but still try to delete import branch if any', async () => {
      const repoUrl = 'https://github.com/my-org-1/my-repo-11';
      const defaultBranch = 'main';
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest.spyOn(mockGithubApiService, 'closePR').mockResolvedValue();
      jest
        .spyOn(mockGithubApiService, 'deleteImportBranch')
        .mockResolvedValue();
      jest
        .spyOn(
          mockCatalogInfoGenerator,
          'listCatalogUrlLocationsByIdFromLocationsEndpoint',
        )
        .mockResolvedValue([
          {
            id: 'location-id-11',
            target: `${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`,
          },
        ]);
      jest
        .spyOn(mockCatalogInfoGenerator, 'deleteCatalogLocationById')
        .mockResolvedValue();
      await deleteImportByRepo(
        logger,
        config,
        mockGithubApiService,
        mockCatalogInfoGenerator,
        repoUrl,
        defaultBranch,
      );

      expect(mockGithubApiService.closePR).not.toHaveBeenCalled();
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenNthCalledWith(
        1,
        logger,
        expect.objectContaining({
          repoUrl,
        }),
      );
      expect(
        mockCatalogInfoGenerator.deleteCatalogLocationById,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCatalogInfoGenerator.deleteCatalogLocationById,
      ).toHaveBeenNthCalledWith(1, 'location-id-11');
    });

    it('should try to delete both PR and branch is there is an open import PR', async () => {
      const repoUrl = 'https://github.com/my-org-1/my-repo-12';
      const defaultBranch = 'dev';
      const prNum = 123456789;
      jest.spyOn(mockGithubApiService, 'findImportOpenPr').mockResolvedValue({
        prNum,
        prUrl: `${repoUrl}/pull/${prNum}`,
      });
      jest.spyOn(mockGithubApiService, 'closePR').mockResolvedValue();
      jest
        .spyOn(mockGithubApiService, 'deleteImportBranch')
        .mockResolvedValue();
      jest
        .spyOn(
          mockCatalogInfoGenerator,
          'listCatalogUrlLocationsByIdFromLocationsEndpoint',
        )
        .mockResolvedValue([
          {
            id: 'location-id-12',
            target: `${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`,
          },
        ]);
      jest
        .spyOn(mockCatalogInfoGenerator, 'deleteCatalogLocationById')
        .mockResolvedValue();
      await deleteImportByRepo(
        logger,
        config,
        mockGithubApiService,
        mockCatalogInfoGenerator,
        repoUrl,
        defaultBranch,
      );

      expect(mockGithubApiService.closePR).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.closePR).toHaveBeenCalledWith(
        logger,
        expect.objectContaining({
          repoUrl,
          comment:
            'Closing PR upon request for bulk import deletion. This request was created from [Red Hat Developer Hub](https://my-backstage-app.example.com).',
        }),
      );
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledWith(
        logger,
        expect.objectContaining({
          repoUrl,
        }),
      );
      expect(
        mockCatalogInfoGenerator.deleteCatalogLocationById,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCatalogInfoGenerator.deleteCatalogLocationById,
      ).toHaveBeenCalledWith('location-id-12');
    });
  });
});
