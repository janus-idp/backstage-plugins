import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';

import { AllowAllPolicy } from './allow-all-policy';

describe('Allow All Policy', () => {
  describe('Allow all policy should allow all', () => {
    let policy: PermissionPolicy;
    beforeEach(() => {
      policy = new AllowAllPolicy();
    });

    it('should be able to create an allow all permission policy', () => {
      expect(policy).not.toBeNull();
    });

    it('should allow all when handle is called', async () => {
      const result = await policy.handle(
        newPolicyQueryWithBasicPermission('catalog.entity.create'),
        newPolicyQueryUser('user:default/guest'),
      );

      expect(result).toStrictEqual({ result: AuthorizeResult.ALLOW });
    });
  });
});

function newPolicyQueryWithBasicPermission(name: string): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: {},
  });
  return { permission: mockPermission };
}

function newPolicyQueryUser(
  user?: string,
  ownershipEntityRefs?: string[],
): PolicyQueryUser | undefined {
  if (user) {
    return {
      identity: {
        ownershipEntityRefs: ownershipEntityRefs ?? [],
        type: 'user',
        userEntityRef: user,
      },
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: true,
        expiresAt: new Date('2021-01-01T00:00:00Z'),
      },
      info: {
        userEntityRef: user,
        ownershipEntityRefs: ownershipEntityRefs ?? [],
      },
      token: 'token',
    };
  }
  return undefined;
}
