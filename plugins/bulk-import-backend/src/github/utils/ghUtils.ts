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

import type {
  CacheService,
  LoggerService,
} from '@backstage/backend-plugin-api';

import { Octokit } from '@octokit/rest';

import {
  isGithubAppCredential,
  type ExtendedGithubCredentials,
  type GithubFetchError,
} from '../types';
import { createCredentialError } from './utils';

const GITHUB_DEFAULT_API_ENDPOINT = 'https://api.github.com';

// Cache TTL per entry added, based on the lower values of rate limits imposed by GH,
// i.e., 5K requests per hour for requests using a personal token.
// GitHub Apps owned by enterprises have a higher limit of 15K per hour.
// See https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28
const RESPONSE_CACHE_TTL_MILLIS = 60 * 60 * 1000;

export function buildOcto(
  deps: {
    logger: LoggerService;
    cache: CacheService;
  },
  input: {
    credential: ExtendedGithubCredentials;
    owner?: string;
    errors?: Map<number, GithubFetchError>;
  },
  apiBaseUrl: string = GITHUB_DEFAULT_API_ENDPOINT,
): Octokit | undefined {
  if ('error' in input.credential) {
    if (input.credential.error?.name !== 'NotFoundError') {
      deps.logger.error(
        `Obtaining the Access Token Github App with appId: ${input.credential.appId} failed with ${input.credential.error}`,
      );
      const credentialError = createCredentialError(input.credential);
      if (credentialError) {
        deps.logger.debug(`${input.credential.appId}: ${credentialError}`);
        if (input.errors) {
          input.errors.set(input.credential.appId, credentialError);
        }
      }
    }
    return undefined;
  }
  if (
    isGithubAppCredential(input.credential) &&
    input.owner &&
    input.credential.accountLogin !== input.owner
  ) {
    return undefined;
  }
  const octokit = new Octokit({
    baseUrl: apiBaseUrl,
    auth: input.credential.token,
  });
  registerHooks(deps, octokit);
  return octokit;
}

function registerHooks(
  deps: {
    logger: LoggerService;
    cache: CacheService;
  },
  octokit: Octokit,
) {
  const extractCacheKey = (options: any) =>
    `${options.method}--${tryReplacingPlaceholdersInUrl(options)}`;

  octokit.hook.before('request', async options => {
    if (!options.headers) {
      options.headers = {
        accept: 'application/json',
        'user-agent': 'rhdh/bulk-import',
      };
    }
    // Use ETag from in-memory cache if available
    const cacheKey = extractCacheKey(options);
    const existingEtag = await deps.cache
      .get(cacheKey)
      ?.then(val => (val as any)?.etag);
    if (existingEtag) {
      options.headers['If-None-Match'] = existingEtag;
    } else {
      deps.logger.debug(`cache miss for key "${cacheKey}"`);
    }
  });

  octokit.hook.after('request', async (response, options) => {
    deps.logger.debug(
      `[GH API] ${options.method} ${tryReplacingPlaceholdersInUrl(options)}: ${response.status}`,
    );
    // If we get a successful response, the resource has changed, so update the in-memory cache
    const cacheKey = extractCacheKey(options);
    await deps.cache.set(
      cacheKey,
      {
        etag: response.headers.etag,
        ...response,
      },
      { ttl: RESPONSE_CACHE_TTL_MILLIS },
    );
  });

  octokit.hook.error('request', async (error: any, options) => {
    deps.logger.debug(
      `[GH API] ${options.method} ${tryReplacingPlaceholdersInUrl(options)}: ${error.status}`,
    );
    if (error.status !== 304) {
      throw error;
    }
    // "304 Not Modified" means that the resource hasn't changed,
    // and we should have a version of it in the cache
    return await deps.cache.get(extractCacheKey(options));
  });
}

function tryReplacingPlaceholdersInUrl(options: any) {
  // options.url might contain placeholders => need to replace them with their actual values to not get colliding keys

  let result = '';
  let startIdx = 0;

  const url = options.url as string | undefined;
  if (!url) {
    return undefined;
  }
  while (startIdx < url.length) {
    const openBraceIdx = url.indexOf('{', startIdx);
    if (openBraceIdx === -1) {
      // no '{' => append the rest of the string
      result += url.slice(startIdx);
      break;
    }

    // append part of the string before '{'
    result += url.slice(startIdx, openBraceIdx);

    const closeBraceIdx = url.indexOf('}', openBraceIdx);
    if (closeBraceIdx === -1) {
      // no '}' => append the rest of the string
      result += url.slice(openBraceIdx);
      break;
    }

    const key = url.slice(openBraceIdx + 1, closeBraceIdx);
    result += options[key] ?? `{${key}}`;

    startIdx = closeBraceIdx + 1;
  }

  return result;
}
