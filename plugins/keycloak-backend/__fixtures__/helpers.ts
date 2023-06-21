import { EntityProviderConnection } from '@backstage/plugin-catalog-node';

import { groupMembers, groups, users } from './data';

export const BASIC_VALID_CONFIG = {
  catalog: {
    providers: {
      keycloakOrg: {
        default: {
          baseUrl: 'http://localhost:8080/auth',
        },
      },
    },
  },
} as const;

export class KeycloakAdminClientMock {
  public constructor() {
    return;
  }

  users = {
    find: jest.fn().mockResolvedValue(users),
    count: jest.fn().mockResolvedValue(users.length),
  };

  groups = {
    find: jest.fn().mockResolvedValue(groups),
    count: jest.fn().mockResolvedValue(groups.length),
    listMembers: jest
      .fn()
      .mockResolvedValueOnce(groupMembers[0])
      .mockResolvedValueOnce(groupMembers[1])
      .mockResolvedValueOnce(groupMembers[2])
      .mockResolvedValueOnce(groupMembers[3]),
  };

  auth = jest.fn().mockResolvedValue({});
}

export const connection = {
  applyMutation: jest.fn(),
  refresh: jest.fn(),
} as unknown as EntityProviderConnection;
