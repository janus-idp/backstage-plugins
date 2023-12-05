import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

import {
  PermissionPolicy,
  Role,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';

import { MemberEntity } from '../types';
import { getKindNamespaceName } from '../utils/rbac-utils';

// @public
export type RBACAPI = {
  getUserAuthorization: () => Promise<{ status: string }>;
  getRoles: () => Promise<Role[]>;
  getPolicies: () => Promise<RoleBasedPolicy[] | Response>;
  deleteRole: (role: string) => Promise<Response>;
  getRole: (role: string) => Promise<Role[]>;
  getMembers: () => Promise<MemberEntity[]>;
  listPermissions: () => Promise<PermissionPolicy[]>;
};

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

// @public
export const rbacApiRef = createApiRef<RBACAPI>({
  id: 'plugin.rbac.service',
});

export class RBACBackendClient implements RBACAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  async getUserAuthorization() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
    return jsonResponse.json();
  }

  async getRoles() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/roles`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
    return jsonResponse.json();
  }

  async getPolicies() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/policies`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async deleteRole(role: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = getKindNamespaceName(role);
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      },
    );
    return jsonResponse;
  }

  async getRole(role: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = getKindNamespaceName(role);
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async getMembers() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/catalog/entities?filter=kind=user&filter=kind=group`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async listPermissions() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/plugins/policies`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    return jsonResponse.json();
  }
}
