import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

import { Role, RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

// @public
export type RBACAPI = {
  getUserAuthorization: () => Promise<{ status: string }>;
  getRoles: () => Promise<Role[]>;
  getPolicies: () => Promise<RoleBasedPolicy[]>;
  deleteRole: (role: string) => Promise<Response>;
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
    return jsonResponse.json();
  }

  async deleteRole(role: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const str = role.split(':');
    const kind = str[0];
    const namespace = str[1].split('/')[0];
    const name = str[1].split('/')[1];
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'DELETE',
      },
    );
    return jsonResponse;
  }
}
