import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import {
  PermissionApi,
  permissionApiRef,
} from '@backstage/plugin-permission-react';
import { TestApiProvider } from '@backstage/test-utils';

import {
  PermissionPolicy,
  Policy,
  Role,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';

import { mockMembers } from '../src/__fixtures__/mockMembers';
import { mockPermissionPolicies } from '../src/__fixtures__/mockPermissionPolicies';
import { mockPolicies } from '../src/__fixtures__/mockPolicies';
import { RBACAPI, rbacApiRef } from '../src/api/RBACBackendClient';
import { RbacPage, rbacPlugin } from '../src/plugin';
import { MemberEntity } from '../src/types';

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
    return mockPolicies;
  }

  async getUserAuthorization(): Promise<{ status: string }> {
    return {
      status: 'Authorized',
    };
  }

  async getRole(role: string): Promise<Role[]> {
    const roleresource = this.resources.find(res => res.name === role);
    return roleresource ? [roleresource] : [];
  }

  async deleteRole(_roleName: string): Promise<any> {
    return { status: 204 };
  }

  async getMembers(): Promise<MemberEntity[]> {
    return mockMembers;
  }

  async listPermissions(): Promise<PermissionPolicy[]> {
    return mockPermissionPolicies;
  }

  async deletePolicy(
    _entityRef: string,
    _permission: string,
    _policies: Policy[],
  ): Promise<number> {
    return 204;
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
