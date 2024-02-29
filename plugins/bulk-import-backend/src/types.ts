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

import { Entity, EntityMeta } from '@backstage/catalog-model';
import { SerializedError } from '@backstage/errors';
import {
  GithubCredentials,
  GithubCredentialsProvider,
} from '@backstage/integration';

export type GithubRepositoryRequest = {
  /**
   * The owner of the repositories in a specific github host in the form of an HTML url
   * e.g "https://github.com/janus-idp"
   */
  owner: string;

  /**
   * Optional token to use for the permissions framework
   */
  backstageToken?: string; // Used for RBAC
};

export type GithubRepository = {
  name: string;
  /**
   * The full name of the repository in the form of owner/repo
   */
  full_name: string;
  /**
   * The API url to the repository
   */
  url: string;
  /**
   * The HTML URL to the repository
   */
  html_url: string;
  /**
   * The default "main" branch of the repository to place the `catalog-info.yaml` file into
   */
  default_branch: string;
};

/**
 * The type of credentials produced by the credential provider.
 *
 * @public
 */

export type GithubRepoFetchError =
  | {
      type: 'app';
      appId: number;
      error: SerializedError;
    }
  | {
      type: 'token';
      error: SerializedError;
    };

export type GithubRepositoryResponse = {
  repositories: GithubRepository[];
  errors: GithubRepoFetchError[];
};

export type AppCredentialFetchResult = AppCredential | AppCredentialError;

export type AppCredential = {
  appId: number;
  accessToken: string | undefined;
};
export type AppCredentialError = { appId: number; error: Error };

export type ExtendedGithubCredentials =
  | GithubCredentials
  | GithubAppCredentials
  | GithubAppError;

export type GithubAppCredentials = GithubCredentials & {
  type: 'app';
  appId: number;
};

export type GithubAppError = {
  type: 'app';
  appId: number;
  error: Error;
};

export function isGithubAppCredential(
  credential: ExtendedGithubCredentials,
): credential is GithubAppCredentials {
  return 'appId' in credential && credential.type === 'app';
}

export interface ExtendedGithubCredentialsProvider
  extends GithubCredentialsProvider {
  getAllCredentials: (options: {
    url: string;
  }) => Promise<ExtendedGithubCredentials[]>;
}

export type CatalogInfoGeneratorOptions = {
  repoInfo: GithubRepository;
  backstageToken?: string;
  /**
   * Every batch of bulk import operation has it's own UUID to track the import job
   */
  bulkImportUUID: string;
  metadata?: EntityMeta;
};

export type ValidatedEntity = Entity | SerializedError[];

export type CatalogInfoEntities = {
  entity: ValidatedEntity;
  locationEntity: ValidatedEntity;
};
