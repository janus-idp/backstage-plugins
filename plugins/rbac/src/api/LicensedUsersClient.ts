import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

export type LicensedUsersAPI = {
  isLicensePluginEnabled(): Promise<boolean>;
  downloadStatistics: () => Promise<Response>;
};

// @public
export const licensedUsersApiRef = createApiRef<LicensedUsersAPI>({
  id: 'plugin.licensed-users-info.service',
});

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class LicensedUsersAPIClient implements LicensedUsersAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }
  async isLicensePluginEnabled(): Promise<boolean> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/licensed-users-info/health`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );

    return jsonResponse.ok;
  }

  async downloadStatistics(): Promise<Response> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const response = await fetch(
      `${backendUrl}/api/licensed-users-info/users`,
      {
        method: 'GET',
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'text/csv',
        },
      },
    );
    return response;
  }
}
