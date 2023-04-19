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

import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { KeycloakProviderConfig } from './config';
import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import { KEYCLOAK_ID_ANNOTATION, KEYCLOAK_REALM_ANNOTATION } from './constants';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

interface GroupRepresentationWithParent extends GroupRepresentation {
  parent?: string;
  members?: string[];
}

export const parseGroup = (
  keycloakGroup: GroupRepresentationWithParent,
  realm: string,
): GroupEntity => {
  if (!keycloakGroup.id) {
    throw new Error(`Group id is required: ${JSON.stringify(keycloakGroup)}`);
  }

  if (!keycloakGroup.name) {
    throw new Error(`Group name is required for group id: ${keycloakGroup.id}`);
  }

  return {
    apiVersion: 'backstage.io/v1beta1',
    kind: 'Group',
    metadata: {
      name: keycloakGroup.name,
      annotations: {
        [KEYCLOAK_ID_ANNOTATION]: keycloakGroup.id,
        [KEYCLOAK_REALM_ANNOTATION]: realm,
      },
    },
    spec: {
      type: 'group',
      profile: {
        displayName: keycloakGroup.name,
      },
      children:
        keycloakGroup.subGroups?.reduce((acc, g) => {
          if (!g.name) {
            throw new Error(`Group name is required: ${JSON.stringify(g)}`);
          }

          acc.push(g.name);
          return acc;
        }, [] as string[]) || [],
      parent: keycloakGroup?.parent,
      members: keycloakGroup.members,
    },
  };
};

export const parseUser = (
  user: UserRepresentation,
  realm: string,
  groups: GroupRepresentationWithParent[],
): UserEntity => {
  if (!user.id) {
    throw new Error(`User id is required: ${JSON.stringify(user)}`);
  }

  if (!user.username) {
    throw new Error(`User username is required for user id: ${user.id}`);
  }

  return {
    apiVersion: 'backstage.io/v1beta1',
    kind: 'User',
    metadata: {
      name: user.username,
      annotations: {
        [KEYCLOAK_ID_ANNOTATION]: user.id,
        [KEYCLOAK_REALM_ANNOTATION]: realm,
      },
    },
    spec: {
      profile: {
        email: user.email,
        displayName:
          [user.firstName, user.lastName].reduce((str, word) => {
            if (!word) {
              return str;
            }

            const trimmed = word.trim();
            if (trimmed.length === 0) {
              return str;
            }

            return str ? `${str} ${word.trim()}` : word.trim();
          }) || user.username,
      },
      memberOf: groups.reduce((acc, g) => {
        // user.username is always defined
        if (g.members?.includes(user.username!)) {
          if (!g.name) {
            throw new Error(`Group name is required: ${JSON.stringify(g)}`);
          }

          acc.push(g.name);
        }
        return acc;
      }, [] as string[]),
    },
  };
};

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

export const readKeycloakRealm = async (
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
): Promise<{
  users: UserEntity[];
  groups: GroupEntity[];
}> => {
  const kUsers = await client.users.find({ realm: config.realm });

  const rawKGroups = await client.groups.find({ realm: config.realm });
  const flatKGroups = rawKGroups.reduce(
    (acc, g) => [...acc, ...traverseGroups(g)],
    [] as GroupRepresentationWithParent[],
  );
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
