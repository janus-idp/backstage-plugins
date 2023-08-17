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

import { GroupEntity, UserEntity } from '@backstage/catalog-model';

import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

export interface GroupRepresentationWithParent extends GroupRepresentation {
  parent?: string;
  members?: string[];
}

export interface GroupRepresentationWithParentAndEntity
  extends GroupRepresentationWithParent {
  entity: GroupEntity;
}

export interface UserRepresentationWithEntity extends UserRepresentation {
  entity: UserEntity;
}

/**
 * Customize the ingested User entity
 *
 * @public
 *
 * @param {UserEntity} entity The output of the default parser
 * @param {UserRepresentation} user Keycloak user representation
 * @param {string} realm Realm name
 * @param {GroupRepresentationWithParentAndEntity[]} groups Data about available groups (can be used to create additional relationships)
 *
 * @returns {Promise<UserEntity | undefined>} Resolve to a modified `UserEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type UserTransformer = (
  entity: UserEntity,
  user: UserRepresentation,
  realm: string,
  groups: GroupRepresentationWithParentAndEntity[],
) => Promise<UserEntity | undefined>;

/**
 * Customize the ingested Group entity
 *
 * @public
 *
 * @param {GroupEntity} entity The output of the default parser
 * @param {GroupRepresentation} group Keycloak group representation
 * @param {string} realm Realm name
 *
 * @returns {Promise<GroupEntity | undefined>} Resolve to a modified `GroupEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type GroupTransformer = (
  entity: GroupEntity,
  group: GroupRepresentation,
  realm: string,
) => Promise<GroupEntity | undefined>;

export type KeycloakOrgConfig = {
  /**
   * Location of the Keycloak instance
   */
  baseUrl: string;
  /**
   * Keycloak realm name. This realm is scraped and entities are
   */
  realm?: string;
  /**
   * Keycloak realm name. This realm is used for authentication using the credentials below.
   */
  loginRealm?: string;
  /**
   * Keycloak credentials. Use together with "password".
   */
  username: string;
  /**
   * Keycloak credentials. Use together with "username".
   * @visibility secret
   */
  password: string;
  /**
   * Keycloak credentials. Use together with "clientSecret".
   */
  clientId: string;
  /**
   * Keycloak credentials. Use together with "clientId".
   * @visibility secret
   */
  clientSecret: string;

  /**
   * The number of users to query at a time.
   * @defaultValue 100
   * @remarks
   * This is a performance optimization to avoid querying too many users at once.
   * @see https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_users_resource
   */
  userQuerySize?: number;

  /**
   * The number of groups to query at a time.
   * @defaultValue 100
   * @remarks
   * This is a performance optimization to avoid querying too many groups at once.
   * @see https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_groups_resource
   */
  groupQuerySize?: number;
};
