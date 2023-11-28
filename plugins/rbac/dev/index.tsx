import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import {
  PermissionApi,
  permissionApiRef,
} from '@backstage/plugin-permission-react';
import { TestApiProvider } from '@backstage/test-utils';

import { Role, RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

import { RBACAPI, rbacApiRef } from '../src/api/RBACBackendClient';
import { RbacPage, rbacPlugin } from '../src/plugin';

class MockPermissionApi implements PermissionApi {
  readonly result;

  constructor(fixtureData: any) {
    this.result = fixtureData;
  }

  async authorize(_request: any): Promise<any> {
    return this.result;
  }
}

class MockRBACApi implements RBACAPI {
  readonly resources;

  constructor(fixtureData: Role[]) {
    this.resources = fixtureData;
  }
  async getRoles(): Promise<Role[]> {
    return this.resources;
  }
  async getPolicies(): Promise<RoleBasedPolicy[]> {
    return [
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
        permission: 'policy-entity',
        policy: 'update',
        effect: 'allow',
      },
    ];
  }

  async getUserAuthorization(): Promise<{ status: string }> {
    return {
      status: 'Authorized',
    };
  }

  async deleteRole(_roleName: string): Promise<any> {
    return { status: 204 };
  }
}

const mockPermissionApi = new MockPermissionApi({ result: 'ALLOW' });
const mockRBACApi = new MockRBACApi([
  {
    memberReferences: ['user:default/guest'],
    name: 'role:default/guests',
  },
  {
    memberReferences: ['user:default/xyz', 'group:default/admins'],
    name: 'role:default/rbac_admin',
  },
]);

createDevApp()
  .registerPlugin(rbacPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [permissionApiRef, mockPermissionApi],
          [rbacApiRef, mockRBACApi],
        ]}
      >
        <RbacPage />
      </TestApiProvider>
    ),
    title: 'Administration',
    path: '/rbac',
  })
  .render();
