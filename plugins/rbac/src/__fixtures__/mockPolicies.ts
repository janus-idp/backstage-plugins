import { RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

export const mockAssociatedPolicies: RoleBasedPolicy[] = [
  {
    entityReference: 'role:default/rbac_admin',
    permission: 'policy-entity',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/rbac_admin',
    permission: 'policy-entity',
    policy: 'create',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/rbac_admin',
    permission: 'policy-entity',
    policy: 'delete',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/rbac_admin',
    permission: 'catalog-entity',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/rbac_admin',
    permission: 'catalog.entity.create',
    policy: 'use',
    effect: 'allow',
  },
];

export const mockPolicies: RoleBasedPolicy[] = [
  {
    entityReference: 'role:default/guests',
    permission: 'catalog-entity',
    policy: 'read',
    effect: 'deny',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'catalog.entity.create',
    policy: 'use',
    effect: 'deny',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'catalog-entity',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'catalog.entity.create',
    policy: 'use',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'policy-entity',
    policy: 'create',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'policy-entity',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'policy.entity.read',
    policy: 'use',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'policy-entity',
    policy: 'delete',
    effect: 'allow',
  },
  ...mockAssociatedPolicies,
];
