/*
 * Copyright 2022 The Janus IDP Authors
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

import { Config } from '@backstage/config';
import {
  readTaskScheduleDefinitionFromConfig,
  TaskScheduleDefinition,
} from '@backstage/backend-tasks';

/**
 * The configuration parameters for a single Keycloak provider.
 *
 * @public
 */
export type KeycloakProviderConfig = {
  /**
   * Identifier of the provider which will be used i.e. at the location key for ingested entities.
   */
  id: string;

  /**
   * The Keycloak base URL
   */
  baseUrl: string;

  /**
   * The username to use for authenticating requests
   * If specified, password must also be specified
   */
  username?: string;

  /**
   * The password to use for authenticating requests
   * If specified, username must also be specified
   */
  password?: string;

  /**
   * The clientId to use for authenticating requests
   * If specified, clientSecret must also be specified
   */
  clientId?: string;

  /**
   * The clientSecret to use for authenticating requests
   * If specified, clientId must also be specified
   */
  clientSecret?: string;

  /**
   * name of the Keycloak realm
   */
  realm: string;

  /**
   * name of the Keycloak login realm
   */
  loginRealm?: string;

  /**
   * Schedule configuration for refresh tasks.
   */
  schedule?: TaskScheduleDefinition;
};

export const readProviderConfigs = (
  config: Config,
): KeycloakProviderConfig[] => {
  const providersConfig = config.getOptionalConfig(
    'catalog.providers.keycloakOrg',
  );
  if (!providersConfig) {
    return [];
  }

  return providersConfig.keys().map(id => {
    const providerConfigInstance = providersConfig.getConfig(id);

    const baseUrl = providerConfigInstance.getString('baseUrl');
    const realm = providerConfigInstance.getOptionalString('realm') ?? 'master';
    const loginRealm =
      providerConfigInstance.getOptionalString('loginRealm') ?? 'master';
    const username = providerConfigInstance.getOptionalString('username');
    const password = providerConfigInstance.getOptionalString('password');
    const clientId = providerConfigInstance.getOptionalString('clientId');
    const clientSecret =
      providerConfigInstance.getOptionalString('clientSecret');

    if (clientId && !clientSecret) {
      throw new Error(
        `clientSecret must be provided when clientId is defined.`,
      );
    }

    if (clientSecret && !clientId) {
      throw new Error(
        `clientId must be provided when clientSecret is defined.`,
      );
    }

    if (username && !password) {
      throw new Error(`password must be provided when username is defined.`);
    }

    if (password && !username) {
      throw new Error(`username must be provided when password is defined.`);
    }

    const schedule = config.has('schedule')
      ? readTaskScheduleDefinitionFromConfig(config.getConfig('schedule'))
      : undefined;

    return {
      id,
      baseUrl,
      loginRealm,
      realm,
      username,
      password,
      clientId,
      clientSecret,
      schedule,
    };
  });
};
