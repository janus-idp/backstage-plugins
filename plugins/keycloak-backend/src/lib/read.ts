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

import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import type UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { Groups } from '@keycloak/keycloak-admin-client/lib/resources/groups';
import { Users } from '@keycloak/keycloak-admin-client/lib/resources/users';

import { KeycloakProviderConfig } from './config';
import {
  KEYCLOAK_ENTITY_QUERY_SIZE,
  KEYCLOAK_ID_ANNOTATION,
  KEYCLOAK_REALM_ANNOTATION,
} from './constants';

interface GroupRepresentationWithParent extends GroupRepresentation {
  parent?: string;
  members?: string[];
}

export const parseGroup = (
  keycloakGroup: GroupRepresentationWithParent,
  realm: string,
): GroupEntity => ({
  apiVersion: 'backstage.io/v1beta1',
  kind: 'Group',
  metadata: {
    name: keycloakGroup.name!,
    annotations: {
      [KEYCLOAK_ID_ANNOTATION]: keycloakGroup.id!,
      [KEYCLOAK_REALM_ANNOTATION]: realm,
    },
  },
  spec: {
    type: 'group',
    profile: {
      displayName: keycloakGroup.name!,
    },
    children: keycloakGroup.subGroups?.map(g => g.name!) || [],
    parent: keycloakGroup?.parent,
    members: keycloakGroup.members,
  },
});
export const parseUser = (
  user: UserRepresentation,
  realm: string,
  groups: GroupRepresentationWithParent[],
): UserEntity => ({
  apiVersion: 'backstage.io/v1beta1',
  kind: 'User',
  metadata: {
    name: user.username!,
    annotations: {
      [KEYCLOAK_ID_ANNOTATION]: user.id!,
      [KEYCLOAK_REALM_ANNOTATION]: realm,
    },
  },
  spec: {
    profile: {
      email: user.email,
      displayName: [user.firstName, user.lastName].filter(Boolean).join(' '),
    },
    memberOf: groups
      .filter(g => g.members?.includes(user.username!))
      .map(g => g.name!),
  },
});

// eslint-disable-next-line consistent-return
export function* traverseGroups(
  group: GroupRepresentation,
): IterableIterator<GroupRepresentationWithParent> {
  yield group;
  for (const g of group.subGroups ?? []) {
    (g as GroupRepresentationWithParent).parent = group.name!;
    yield* traverseGroups(g);
  }
}

export async function getEntities<T extends Users | Groups>(
  entities: T,
  config: KeycloakProviderConfig,
  entityQuerySize: number = KEYCLOAK_ENTITY_QUERY_SIZE,
): Promise<Awaited<ReturnType<T['find']>>> {
  const rawEntityCount = await entities.count({ realm: config.realm });
  const entityCount =
    typeof rawEntityCount === 'number' ? rawEntityCount : rawEntityCount.count;

  const pageCount = Math.ceil(entityCount / entityQuerySize);

  // The next line acts like range in python
  const entityPromises = Array.from(
    { length: pageCount },
    (_, i) =>
      entities.find({
        realm: config.realm,
        max: entityQuerySize,
        first: i * entityQuerySize,
      }) as ReturnType<T['find']>,
  );

  const entityResults = (await Promise.all(entityPromises)).flat() as Awaited<
    ReturnType<T['find']>
  >;

  return entityResults;
}

export const readKeycloakRealm = async (
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
  options?: {
    userQuerySize?: number;
    groupQuerySize?: number;
  },
): Promise<{
  users: UserEntity[];
  groups: GroupEntity[];
}> => {
  const kUsers = await getEntities(
    client.users,
    config,
    options?.userQuerySize,
  );

  const rawKGroups = await getEntities(
    client.groups,
    config,
    options?.groupQuerySize,
  );
  const flatKGroups = rawKGroups.reduce((acc, g) => {
    const newAcc = acc.concat(...traverseGroups(g));
    return newAcc;
  }, [] as GroupRepresentationWithParent[]);
  const kGroups = await Promise.all(
    flatKGroups.map(async g => {
      g.members = (
        await client.groups.listMembers({
          id: g.id!,
          realm: config.realm,
        })
      ).map(m => m.username!);
      return g;
    }),
  );

  const users = kUsers.map(u => parseUser(u, config.realm, kGroups));
  const groups = kGroups.map(g => parseGroup(g, config.realm));

  return { users, groups };
};
