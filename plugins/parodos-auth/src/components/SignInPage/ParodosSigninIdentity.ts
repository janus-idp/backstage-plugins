import {
  type BackstageUserIdentity,
  type IdentityApi,
} from '@backstage/core-plugin-api';

export const SessionStorageKey = 'parados_plugin';

export class ParodosSignInIdentity implements IdentityApi {
  constructor(private userName: string, private password: string) {}

  async getBackstageIdentity(): Promise<BackstageUserIdentity> {
    return {
      type: 'user',
      userEntityRef: `user:default/${this.userName}`,
      ownershipEntityRefs: [`user:default/${this.userName}`],
    };
  }
  async getProfileInfo() {
    return {
      displayName: this.userName,
      email: `${this.userName}@redhat.com`,
    };
  }

  async getCredentials() {
    let token = sessionStorage.getItem(SessionStorageKey);

    if (!token) {
      token = Buffer.from(`${this.userName}:${this.password}`).toString(
        'base64',
      );
      sessionStorage.setItem(SessionStorageKey, token);
    }
    return {
      token,
    };
  }
  async signOut() {
    sessionStorage.clear();
  }
}
