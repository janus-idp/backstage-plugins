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
import { Logger } from 'winston';
import { KEYCLOAK_ID_ANNOTATION, KEYCLOAK_REALM_ANNOTATION } from './constants';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

export async function readKeycloakRealm(
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
  logger: Logger,
): Promise<{
  users: UserEntity[];
  groups: GroupEntity[];
}> {
  const { users } = await readKeycloakUsers(client, config);
  const { groups, groupMembers } = await readKeycloakGroups(
    client,
    config,
    logger,
  );

  const usersByName = new Map(users.map(u => [u.metadata.name, u]));
  const groupsById = new Map(
    groups.map(g => [g.metadata.annotations?.[KEYCLOAK_ID_ANNOTATION]!, g]),
  );

  // Assign Groups to Users and Users to Group
  for (const [groupId, userNames] of groupMembers.entries()) {
    for (const userName of userNames) {
      const user = usersByName.get(userName);
      const group = groupsById.get(groupId);

      if (user && !user.spec.memberOf?.includes(group?.metadata.name!)) {
        if (!user.spec.memberOf) {
          user.spec.memberOf = [];
        }
        user.spec.memberOf.push(group?.metadata.name!);
      }

      if (group && !group.spec.members?.includes(user?.metadata.name!)) {
        if (!group.spec.members) {
          group.spec.members = [];
        }

        group.spec.members.push(user?.metadata.name!);
      }
    }
  }

  return { users, groups };
}

export async function readKeycloakGroups(
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
  logger: Logger,
): Promise<{
  groups: GroupEntity[];
  groupMembers: Map<string, string[]>;
}> {
  const groups: GroupEntity[] = [];
  const groupMembers = new Map<string, string[]>();

  const keycloakGroups = await client.groups.find({ realm: config.realm });

  for (const keycloakGroup of keycloakGroups) {
    const { addedGroups, addedGroupMembers } = await addGroup(
      client,
      keycloakGroup,
      undefined,
      config,
      logger,
    );

    // Add to groups and members
    groups.push(...addedGroups);
    addedGroupMembers.forEach((value, key) => groupMembers.set(key, value));
  }

  return { groups, groupMembers };
}

export async function readKeycloakUsers(
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
): Promise<{
  users: UserEntity[];
}> {
  const users: UserEntity[] = [];

  const keycloakUsers = await client.users.find({ realm: config.realm });

  for (const keycloakUser of keycloakUsers) {
    const entity: UserEntity = {
      apiVersion: 'backstage.io/v1beta1',
      kind: 'User',
      metadata: {
        name: keycloakUser.username!,
        annotations: {
          [KEYCLOAK_ID_ANNOTATION]: keycloakUser.id!,
          [KEYCLOAK_REALM_ANNOTATION]: config.realm,
        },
      },
      spec: {
        profile: {},
        memberOf: [],
      },
    };

    let displayNameArray = [keycloakUser.firstName, keycloakUser.lastName];
    displayNameArray = displayNameArray.filter(Boolean);

    const displayName = displayNameArray.join(' ');

    if (keycloakUser.email) entity.spec.profile!.email = keycloakUser.email;
    if (displayName) entity.spec.profile!.displayName = displayName;

    users.push(entity);
  }

  return { users };
}

export async function addGroup(
  client: KeycloakAdminClient,
  keycloakGroup: GroupRepresentation,
  keycloakParentGroup: GroupRepresentation | undefined,
  config: KeycloakProviderConfig,
  logger: Logger,
): Promise<{
  addedGroups: GroupEntity[];
  addedGroupMembers: Map<string, string[]>;
}> {
  const groups: GroupEntity[] = [];
  const groupMembers = new Map<string, string[]>();

  // Transform into Entity
  const group = await defaultGroupTransformer(keycloakGroup, config);

  if (keycloakParentGroup !== undefined) {
    group.spec.parent = keycloakParentGroup.name;
  }

  groups.push(group);

  // Retrieve Group Members
  groupMembers.set(
    keycloakGroup.id!,
    Array.from(
      await readGroupMembers(client, config, keycloakGroup),
      x => x.username!,
    ),
  );

  if (keycloakGroup.subGroups) {
    for (const subgroup of keycloakGroup.subGroups) {
      // Add subgroup as child to parent
      group.spec.children.push(subgroup.name!);

      const { addedGroups, addedGroupMembers } = await addGroup(
        client,
        subgroup,
        keycloakGroup,
        config,
        logger,
      );

      // Add to groups and members
      groups.push(...addedGroups);
      addedGroupMembers.forEach((value, key) => groupMembers.set(key, value));
    }
  }

  return { addedGroups: groups, addedGroupMembers: groupMembers };
}

export async function readGroupMembers(
  client: KeycloakAdminClient,
  config: KeycloakProviderConfig,
  group: GroupRepresentation,
): Promise<UserRepresentation[]> {
  return await client.groups.listMembers({
    id: group.id!,
    realm: config.realm,
  });
}

export async function defaultGroupTransformer(
  group: GroupRepresentation,
  config: KeycloakProviderConfig,
): Promise<GroupEntity> {
  const entity: GroupEntity = {
    apiVersion: 'backstage.io/v1beta1',
    kind: 'Group',
    metadata: {
      name: group.name!,
      annotations: {
        [KEYCLOAK_ID_ANNOTATION]: group.id!,
        [KEYCLOAK_REALM_ANNOTATION]: config.realm,
      },
    },
    spec: {
      type: 'group',
      profile: {
        displayName: group.name!,
      },
      children: [],
    },
  };

  return entity;
}
