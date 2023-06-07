import KeycloakAdminClient from '@keycloak/keycloak-admin-client';

import {
  groupMembers as testGroupMembers,
  groups as testGroups,
  users as testUsers,
} from '../../__fixtures__/data';
import { KeycloakProviderConfig } from './config';
import { readKeycloakRealm } from './read';

const client = {
  users: {
    find: jest.fn().mockResolvedValue(testUsers),
    count: jest.fn().mockResolvedValue(testUsers.length),
  },
  groups: {
    find: jest.fn().mockResolvedValue(testGroups),
    count: jest.fn().mockResolvedValue(testGroups.length),
    listMembers: jest
      .fn()
      .mockResolvedValueOnce(testGroupMembers[0])
      .mockResolvedValueOnce(testGroupMembers[1])
      .mockResolvedValueOnce(testGroupMembers[2])
      .mockResolvedValueOnce(testGroupMembers[3]),
  },
} as unknown as KeycloakAdminClient;

const config = {
  realm: 'myrealm',
} as unknown as KeycloakProviderConfig;

describe('readKeycloakRealm', () => {
  it('should return the correct number of users and groups', async () => {
    const { users, groups } = await readKeycloakRealm(client, config);

    expect(users).toHaveLength(3);
    expect(groups).toHaveLength(4);
  });
});
