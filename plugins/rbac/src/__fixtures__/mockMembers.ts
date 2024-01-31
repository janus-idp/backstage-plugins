import { MemberEntity } from '../types';

export const mockMembers: MemberEntity[] = [
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'team-d',
      description: 'Team D',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'team',
      profile: {
        displayName: 'Team D',
      },
      parent: 'boxoffice',
      children: [],
    },
    relations: [
      {
        type: 'childOf',
        targetRef: 'group:default/boxoffice',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/eva.macdowell',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/lucy.sheehan',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'infrastructure',
      description: 'The infra department',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'department',
      parent: 'acme-corp',
      children: ['backstage', 'boxoffice'],
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
      },
    ],
  },
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
    relations: [],
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
        type: 'childOf',
        targetRef: 'group:default/backstage',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/breanna.davison',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/guest',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/janelle.dawe',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/nigel.manning',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'backstage',
      description: 'The backstage sub-department',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'sub-department',
      profile: {
        displayName: 'Backstage',
      },
      parent: 'infrastructure',
      children: ['team-a', 'team-b'],
    },
    relations: [],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'team-b',
      description: 'Team B',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'team',
      profile: {
        displayName: 'Team B',
      },
      parent: 'backstage',
      children: [],
    },
    relations: [
      {
        type: 'hasMember',
        targetRef: 'user:default/amelia.park',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/colette.brock',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/jenny.doe',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/jonathon.page',
      },
      {
        type: 'hasMember',
        targetRef: 'user:default/justine.barrow',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'lucy.sheehan',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    spec: {
      profile: {
        displayName: 'Lucy Sheehan',
      },
      memberOf: ['team-d'],
    },
    relations: [
      {
        type: 'memberOf',
        targetRef: 'group:default/team-d',
      },
    ],
  },
  {
    metadata: {
      namespace: 'default',
      annotations: {},
      name: 'boxoffice',
      description: 'The boxoffice sub-department',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    spec: {
      type: 'sub-department',
      profile: {
        displayName: 'Box Office',
      },
      parent: 'infrastructure',
      children: ['team-c', 'team-d'],
    },
    relations: [
      {
        type: 'childOf',
        targetRef: 'group:default/infrastructure',
      },
      {
        type: 'parentOf',
        targetRef: 'group:default/team-c',
      },
      {
        type: 'parentOf',
        targetRef: 'group:default/team-d',
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
      },
    ],
  },
];
