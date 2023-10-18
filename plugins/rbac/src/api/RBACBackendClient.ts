import { ConfigApi, createApiRef } from '@backstage/core-plugin-api';

// @public
export type RBACAPI = {
  getUserAuthorization: (userEntityRef: string) => Promise<Boolean>;
};

type Options = {
  configApi: ConfigApi;
};

// @public
export const rbacApiRef = createApiRef<RBACAPI>({
  id: 'plugin.rbac.service',
});

export class RBACBackendClient implements RBACAPI {
  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
  }

  async getUserAuthorization(userEntityRef: string): Promise<Boolean> {
    console.log('!!!!!configg ', this.configApi);
    const adminUsers = this.configApi.getOptionalConfig('permission');
    console.log('!!!!userEntityRef ', userEntityRef);
    console.log('!!!!admins ', adminUsers);
    return true;
  }
}
