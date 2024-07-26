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

import {
  Groups,
  KeycloakAdminClient,
  Users,
} from '@s3pweb/keycloak-admin-client-cjs';
import type {
  GroupRepresentation,
  UserRepresentation,
} from '@s3pweb/keycloak-admin-client-cjs';
import { all } from 'deepmerge';

import { KeycloakProviderConfig } from './config';
import {
  KEYCLOAK_ENTITY_QUERY_SIZE,
  KEYCLOAK_ID_ANNOTATION,
  KEYCLOAK_REALM_ANNOTATION,
} from './constants';
import { noopGroupTransformer, noopUserTransformer } from './transformers';
import {
  GroupRepresentationWithParent,
  GroupRepresentationWithParentAndEntity,
  GroupTransformer,
  UserRepresentationWithEntity,
  UserTransformer,
} from './types';

export const parseGroup = async (
  keycloakGroup: GroupRepresentationWithParent,
  realm: string,
  groupTransformer?: GroupTransformer,
): Promise<GroupEntity | undefined> => {
  const transformer = groupTransformer ?? noopGroupTransformer;
  const entity: GroupEntity = {
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
      // children, parent and members are updated again after all group and user transformers applied.
      children: keycloakGroup.subGroups?.map(g => g.name!) ?? [],
      parent: keycloakGroup.parent,
      members: keycloakGroup.members,
    },
  };

  return await transformer(entity, keycloakGroup, realm);
};

export const parseUser = async (
  user: UserRepresentation,
  realm: string,
  keycloakGroups: GroupRepresentationWithParentAndEntity[],

  userTransformer?: UserTransformer,
): Promise<UserEntity | undefined> => {
  const transformer = userTransformer ?? noopUserTransformer;
  const entity: UserEntity = {
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
        ...(user.firstName || user.lastName
          ? {
              displayName: [user.firstName, user.lastName]
                .filter(Boolean)
                .join(' '),
            }
          : {}),
      },
      memberOf: keycloakGroups
        .filter(g => g.members?.includes(user.username!))
        .map(g => g.entity.metadata.name),
    },
  };

  return await transformer(entity, user, realm, keycloakGroups);
};

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

export async function processGroupsRecursively<T extends Groups>(
  topLevelGroups: T[],
  entities: T,
) {
  const allGroups: T[] = [];
  for (const group of topLevelGroups) {
    allGroups.push(group);

    if (group.subGroupCount! > 0) {
      const subgroups = await entities.listSubGroups({
        parentId: group.id!,
        first: 0,
        max: group.subGroupCount,
        briefRepresentation: true,
      });
      const subGroupResults = await processGroupsRecursively(
        subgroups,
        entities,
      );
      allGroups.push(...subGroupResults);
    }
  }

  return allGroups;
}

export const readKeycloakRealm = async (
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
  options?: {
    userQuerySize?: number;
    groupQuerySize?: number;
    userTransformer?: UserTransformer;
    groupTransformer?: GroupTransformer;
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

  // console.log('server info');
  // const serverInfo = await client.serverInfo.find();
  // const serverVersion = serverInfo.systemInfo?.version?.slice(0, 2);

  // console.log(serverVersion);

  const topLevelKGroups = (await getEntities(
    client.groups,
    config,
    options?.groupQuerySize,
    // serverVersion,
  )) as GroupRepresentationWithParent[];

  const rawKGroups = await processGroupsRecursively(
    topLevelKGroups,
    client.groups as Groups,
  );

  const kGroups = await Promise.all(
    rawKGroups.map(async g => {
      g.members = (
        await client.groups.listMembers({
          id: g.id!,
          max: options?.userQuerySize,
          realm: config.realm,
        })
      )?.map(m => m.username!);
      if (g.subGroupCount! > 0) {
        g.subGroups = await client.groups.listSubGroups({
          parentId: g.id!,
          first: 0,
          max: g.subGroupCount,
          briefRepresentation: false,
        });
      }
      if (g.parentId) {
        const groupParent = await client.groups.findOne({
          id: g.parentId!,
          realm: config.realm,
        });
        g.parent = groupParent?.name;
      }
      return g;
    }),
  );

  const parsedGroups = await kGroups.reduce(
    async (promise, g) => {
      const partial = await promise;
      const entity = await parseGroup(
        g,
        config.realm,
        options?.groupTransformer,
      );
      if (entity) {
        const group = {
          ...g,
          entity,
        } as GroupRepresentationWithParentAndEntity;
        partial.push(group);
      }
      return partial;
    },
    Promise.resolve([] as GroupRepresentationWithParentAndEntity[]),
  );

  const parsedUsers = await kUsers.reduce(
    async (promise, u) => {
      const partial = await promise;
      const entity = await parseUser(
        u,
        config.realm,
        parsedGroups,
        options?.userTransformer,
      );
      if (entity) {
        const user = { ...u, entity } as UserRepresentationWithEntity;
        partial.push(user);
      }
      return partial;
    },
    Promise.resolve([] as UserRepresentationWithEntity[]),
  );

  const groups = parsedGroups.map(g => {
    const entity = g.entity;
    entity.spec.members =
      g.entity.spec.members?.map(
        m => parsedUsers.find(p => p.username === m)?.entity.metadata.name!,
      ) ?? [];
    entity.spec.children =
      g.entity.spec.children?.map(
        c => parsedGroups.find(p => p.name === c)?.entity.metadata.name!,
      ) ?? [];
    entity.spec.parent = parsedGroups.find(
      p => p.name === entity.spec.parent,
    )?.entity.metadata.name;
    return entity;
  });

  return { users: parsedUsers.map(u => u.entity), groups };
};
