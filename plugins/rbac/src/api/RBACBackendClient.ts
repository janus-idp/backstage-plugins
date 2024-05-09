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

import {
  MemberEntity,
  PluginConditionRules,
  RoleBasedConditions,
  RoleError,
} from '../types';
import { getKindNamespaceName } from '../utils/rbac-utils';

// @public
export type RBACAPI = {
  getUserAuthorization: () => Promise<{ status: string }>;
  getRoles: () => Promise<Role[] | Response>;
  getPolicies: () => Promise<RoleBasedPolicy[] | Response>;
  getAssociatedPolicies: (
    entityReference: string,
  ) => Promise<RoleBasedPolicy[] | Response>;
  deleteRole: (role: string) => Promise<Response>;
  getRole: (role: string) => Promise<Role[] | Response>;
  getMembers: () => Promise<MemberEntity[] | Response>;
  listPermissions: () => Promise<PermissionPolicy[] | Response>;
  createRole: (role: Role) => Promise<RoleError | Response>;
  updateRole: (oldRole: Role, newRole: Role) => Promise<RoleError | Response>;
  updatePolicies: (
    entityReference: string,
    oldPolicy: RoleBasedPolicy[],
    newPolicy: RoleBasedPolicy[],
  ) => Promise<RoleError | Response>;
  createPolicies: (polices: RoleBasedPolicy[]) => Promise<RoleError | Response>;
  deletePolicies: (
    entityReference: string,
    polices: RoleBasedPolicy[],
  ) => Promise<RoleError | Response>;
  getPluginsConditionRules: () => Promise<PluginConditionRules[] | Response>;
  createConditionalPermission: (
    conditionalPermission: RoleBasedConditions,
  ) => Promise<RoleError | Response>;
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

    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }

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

  async getAssociatedPolicies(entityReference: string) {
    const { kind, namespace, name } = getKindNamespaceName(entityReference);
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/policies/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
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
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async createRole(role: Role) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify(role),
    });
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async updateRole(oldRole: Role, newRole: Role) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = getKindNamespaceName(oldRole.name);
    const body = {
      oldRole,
      newRole,
    };
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/${kind}/${namespace}/${name}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(body),
      },
    );
    if (
      jsonResponse.status !== 200 &&
      jsonResponse.status !== 201 &&
      jsonResponse.status !== 204
    ) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async updatePolicies(
    entityReference: string,
    oldPolicies: RoleBasedPolicy[],
    newPolicies: RoleBasedPolicy[],
  ) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = getKindNamespaceName(entityReference);
    const body = {
      oldPolicy: oldPolicies,
      newPolicy: newPolicies,
    };
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/policies/${kind}/${namespace}/${name}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(body),
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async deletePolicies(entityReference: string, policies: RoleBasedPolicy[]) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = getKindNamespaceName(entityReference);
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/policies/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(policies),
        method: 'DELETE',
      },
    );

    if (
      jsonResponse.status !== 200 &&
      jsonResponse.status !== 201 &&
      jsonResponse.status !== 204
    ) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async createPolicies(policies: RoleBasedPolicy[]) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify(policies),
    });
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async getPluginsConditionRules() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/plugins/condition-rules`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async createConditionalPermission(
    conditionalPermission: RoleBasedConditions,
  ) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/conditions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(conditionalPermission),
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }
}
