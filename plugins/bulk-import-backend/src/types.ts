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

import type { SerializedError } from '@backstage/errors';
import type {
  GithubCredentials,
  GithubCredentialsProvider,
} from '@backstage/integration';

// From https://docs.github.com/en/rest/orgs/orgs?apiVersion=2022-11-28#list-organizations
export type GithubOrganization = {
  name: string;
  id: number;
  description?: string;
  url?: string;
  html_url?: string;
  repos_url?: string;
  events_url?: string;
  hooks_url?: string;
  issues_url?: string;
  members_url?: string;
  public_members_url?: string;
  avatar_url?: string;
  public_repos?: number;
  total_private_repos?: number;
  /**
   * Number of internal repositories, accessible to all members in a GH enterprise
   */
  owned_private_repos?: number;
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
  /**
   * The date-time the repository was last updated at
   */
  updated_at?: string | null;
};

/**
 * The type of credentials produced by the credential provider.
 *
 * @public
 */

export type GithubFetchError =
  | {
      type: 'app';
      appId: number;
      error: SerializedError;
    }
  | {
      type: 'token';
      error: SerializedError;
    };

export type GithubOrganizationResponse = {
  organizations: GithubOrganization[];
  errors: GithubFetchError[];
  totalCount?: number;
};

export type GithubRepositoryResponse = {
  repositories: GithubRepository[];
  errors: GithubFetchError[];
  totalCount?: number;
};

export type AppCredentialFetchResult = AppCredential | AppCredentialError;

export type AppCredential = {
  appId: number;
  accessToken: string | undefined;
  installationAccountLogin?: string;
};
export type AppCredentialError = { appId: number; error: Error };

export type ExtendedGithubCredentials =
  | GithubCredentials
  | GithubAppCredentials
  | GithubAppError;

export type GithubAppCredentials = GithubCredentials & {
  type: 'app';
  appId: number;
  accountLogin?: string;
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
    host: string;
  }) => Promise<ExtendedGithubCredentials[]>;
}
