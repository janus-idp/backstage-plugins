import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';

import { newEnforcer, newModelFromString, StringAdapter } from 'casbin';

import { MODEL } from './permission-model';
import { RBACPermissionPolicy } from './permission-policy';

describe('RBACPermissionPolicy Tests', () => {
  it('should build', async () => {
    const adapter = new StringAdapter(
      `p, known_user, test-resource, update, allow `,
    );
    const theModel = newModelFromString(MODEL);
    const enf = await newEnforcer(theModel, adapter);
    const config = newConfigReader();
    const policy = await RBACPermissionPolicy.build(
      getVoidLogger(),
      config,
      enf,
    );
    expect(policy).not.toBeNull();
  });

  describe('Policy checks', () => {
    let policy: RBACPermissionPolicy;

    beforeEach(async () => {
      const adapter = new StringAdapter(
        `
                p, known_user, test.resource.deny, use, deny
                p, duplicated, test.resource, use, allow
                p, duplicated, test.resource, use, deny
                p, known_user, test.resource, use, allow

                p, known_user, test-resource-deny, update, deny 
                p, duplicated, test-resource, update, allow
                p, duplicated, test-resource, update, deny
                p, known_user, test-resource, update, allow 

                p, group, test.resource.deny, use, deny
                `,
      );
      const theModel = newModelFromString(MODEL);
      const enf = await newEnforcer(theModel, adapter);
      const config = newConfigReader();
      policy = await RBACPermissionPolicy.build(getVoidLogger(), config, enf);
    });
    // +-------+------+------------------------+
    // | allow | deny |         result         |
    // +-------+------+------------------------+
    // | N     | Y    | deny                   | 1
    // | N     | N    | deny (user not listed) | 2
    // | Y     | Y    | deny (duplicated)      | 3
    // | Y     | N    | allow                  | 4

    // case1
    it('should deny access to basic permission for listed user with deny action', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource.deny'),
        newIdentityResponse('known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case2
    it('should deny access to basic permission for unlisted user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('unknown_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case3
    it('should deny access to basic permission for listed user deny and allow', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('duplicated'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case4
    it('should allow access to basic permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // Tests for Resource Permission type

    // case1
    it('should deny access to resource permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.deny',
          'test-resource-deny',
          'update',
        ),
        newIdentityResponse('known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case 2
    it('should deny access to resource permission for user unlisted on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newIdentityResponse('unknown_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case 3
    it('should deny access to resource permission for user listed deny and allow', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newIdentityResponse('duplicated'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case 4
    it('should allow access to resource permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newIdentityResponse('known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // Tests for actions on resource permissions
    it('should deny access to resource permission for unlisted action for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'delete',
        ),
        newIdentityResponse('known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });

    // Tests for admin added through app config
    it('should allow access to permission resource for admin added through app config', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'policy-entity.read',
          'policy-entity',
          'read',
        ),
        newIdentityResponse('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // Tests for admin group added through app config
    it('should allow access to permission resource for admin group added through app config', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'policy-entity.read',
          'policy-entity',
          'read',
        ),
        newIdentityResponseWithGroup(
          'user:default/guest2',
          'group:default/guests',
        ),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // Test for group access permission
    it('should allow access to a user in an authorized group', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource.deny'),
        newIdentityResponseWithGroup('known_user', 'group'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
  });
});

function newPolicyQueryWithBasicPermission(
  name: string,
  action?: 'create' | 'read' | 'update' | 'delete' | undefined,
): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: {},
  });
  if (action) {
    mockPermission.attributes.action = action;
  }
  return { permission: mockPermission };
}

function newPolicyQueryWithResourcePermission(
  name: string,
  resource: string,
  action?: 'create' | 'read' | 'update' | 'delete' | undefined,
): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: {},
    resourceType: resource,
  });
  if (action) {
    mockPermission.attributes.action = action;
  }
  return { permission: mockPermission };
}

function newIdentityResponse(user: string): BackstageIdentityResponse {
  return {
    identity: {
      ownershipEntityRefs: [],
      type: 'user',
      userEntityRef: user,
    },
    token: '',
  };
}

function newIdentityResponseWithGroup(
  user: string,
  group: string,
): BackstageIdentityResponse {
  return {
    identity: {
      ownershipEntityRefs: [group],
      type: 'user',
      userEntityRef: user,
    },
    token: '',
  };
}

function newConfigReader(): ConfigReader {
  return new ConfigReader({
    permission: {
      rbac: {
        admin: {
          users: [
            {
              name: 'user:default/guest',
            },
            {
              name: 'group:default/guests',
            },
          ],
        },
      },
    },
  });
}
