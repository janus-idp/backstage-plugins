import {
  type BackstageUserIdentity,
  type IdentityApi,
} from '@backstage/core-plugin-api';

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
      displayName: 'Mock',
      email: 'mock@redhat.com',
    };
  }
  async getCredentials() {
    return {
      token: Buffer.from(`${this.userName}:${this.password}`).toString(
        'base64',
      ),
    };
  }
  async signOut() {
    return undefined;
  }
}
