import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useMembers } from './useMembers';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getRole: jest.fn().mockReturnValue([
      {
        memberReferences: [
          'group:default/admins',
          'user:default/amelia.park',
          'user:default/calum.leavy',
          'group:default/team-b',
          'group:default/team-c',
        ],
        name: 'role:default/rbac_admin',
      },
    ]),
    getMembers: jest.fn().mockReturnValue([
      {
        metadata: {
          namespace: 'default',
          annotations: {},
          name: 'janus-authors',
          title: 'Janus-IDP Authors',
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        spec: {
          type: 'team',
          children: [],
        },
        relations: [
          {
            type: 'ownerOf',
            targetRef: 'component:default/backstage-showcase',
            target: {
              kind: 'component',
              namespace: 'default',
              name: 'backstage-showcase',
            },
          },
        ],
      },
      {
        metadata: {
          namespace: 'default',
          annotations: {},
          name: 'team-a',
          description: 'Team A',
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        spec: {
          type: 'team',
          profile: {},
          parent: 'backstage',
          children: [],
        },
        relations: [
          {
            type: 'hasMember',
            targetRef: 'user:default/breanna.davison',
            target: {
              kind: 'user',
              namespace: 'default',
              name: 'breanna.davison',
            },
          },
          {
            type: 'hasMember',
            targetRef: 'user:default/guest',
            target: {
              kind: 'user',
              namespace: 'default',
              name: 'guest',
            },
          },
        ],
      },
      {
        metadata: {
          namespace: 'default',
          annotations: {},
          name: 'amelia.park',
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        spec: {
          profile: {
            displayName: 'Amelia Park',
          },
          memberOf: ['team-b'],
        },
        relations: [
          {
            type: 'memberOf',
            targetRef: 'group:default/team-b',
            target: {
              kind: 'group',
              namespace: 'default',
              name: 'team-b',
            },
          },
        ],
      },
      {
        metadata: {
          namespace: 'default',
          annotations: {},
          name: 'acme-corp',
          description: 'The acme-corp organization',
          links: [],
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        spec: {
          type: 'organization',
          profile: {
            displayName: 'ACME Corp',
          },
          children: ['infrastructure'],
        },
        relations: [],
      },
      {
        metadata: {
          namespace: 'default',
          annotations: {},
          name: 'guest',
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        spec: {
          profile: {
            displayName: 'Guest User',
          },
          memberOf: ['team-a'],
        },
        relations: [
          {
            type: 'memberOf',
            targetRef: 'group:default/team-a',
            target: {
              kind: 'group',
              namespace: 'default',
              name: 'team-a',
            },
          },
        ],
      },
      {
        metadata: {
          namespace: 'default',
          annotations: {},
          name: 'jenny.doe',
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        spec: {
          profile: {
            displayName: 'Jenny Doe',
          },
          memberOf: ['team-b'],
        },
        relations: [
          {
            type: 'memberOf',
            targetRef: 'group:default/team-b',
            target: {
              kind: 'group',
              namespace: 'default',
              name: 'team-b',
            },
          },
        ],
      },
      {
        metadata: {
          namespace: 'default',
          annotations: {},
          name: 'team-c',
          description: 'Team C',
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        spec: {
          type: 'team',
          profile: {
            displayName: 'Team C',
          },
          parent: 'boxoffice',
          children: [],
        },
        relations: [
          {
            type: 'hasMember',
            targetRef: 'user:default/calum.leavy',
            target: {
              kind: 'user',
              namespace: 'default',
              name: 'calum.leavy',
            },
          },
          {
            type: 'hasMember',
            targetRef: 'user:default/frank.tiernan',
            target: {
              kind: 'user',
              namespace: 'default',
              name: 'frank.tiernan',
            },
          },
        ],
      },
    ]),
  }),
}));

describe('useMembers', () => {
  it('should return members', async () => {
    const { result } = renderHook(() => useMembers('role:default/rbac_admin'));
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(5);
    });
  });
});
