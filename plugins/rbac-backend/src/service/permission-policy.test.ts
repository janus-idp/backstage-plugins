import { getVoidLogger, TokenManager } from '@backstage/backend-common';
import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';

import {
  Adapter,
  Enforcer,
  Model,
  newEnforcer,
  newModelFromString,
  StringAdapter,
} from 'casbin';
import { Logger } from 'winston';

import { resolve } from 'path';

import { MODEL } from './permission-model';
import { RBACPermissionPolicy } from './permission-policy';
import { BackstageRoleManager } from './role-manager';

const catalogApi = {
  getEntityAncestors: jest.fn().mockImplementation(),
  getLocationById: jest.fn().mockImplementation(),
  getEntities: jest.fn().mockImplementation(),
  getEntitiesByRefs: jest.fn().mockImplementation(),
  queryEntities: jest.fn().mockImplementation(),
  getEntityByRef: jest.fn().mockImplementation(),
  refreshEntity: jest.fn().mockImplementation(),
  getEntityFacets: jest.fn().mockImplementation(),
  addLocation: jest.fn().mockImplementation(),
  getLocationByRef: jest.fn().mockImplementation(),
  removeLocationById: jest.fn().mockImplementation(),
  removeEntityByUid: jest.fn().mockImplementation(),
  validateEntity: jest.fn().mockImplementation(),
};

const tokenManagerMock = {
  getToken: jest.fn().mockImplementation(async () => {
    return Promise.resolve({ token: 'some-token' });
  }),
  authenticate: jest.fn().mockImplementation(),
};

const conditionalStorage = {
  getConditions: jest.fn().mockImplementation(),
  createCondition: jest.fn().mockImplementation(),
  findCondition: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: Logger,
  tokenManager: TokenManager,
): Promise<Enforcer> {
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(catalogApi, logger, tokenManager);
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

describe('RBACPermissionPolicy Tests', () => {
  it('should build', async () => {
    const adapter = new StringAdapter(
      `p, user:default/known_user, test-resource, update, allow `,
    );
    const config = newConfigReader();
    const theModel = newModelFromString(MODEL);
    const logger = getVoidLogger();
    const enf = await createEnforcer(
      theModel,
      adapter,
      logger,
      tokenManagerMock,
    );

    const policy = await RBACPermissionPolicy.build(
      logger,
      config,
      conditionalStorage,
      enf,
    );

    expect(policy).not.toBeNull();
  });

  describe('Policy checks from csv file', () => {
    let policy: RBACPermissionPolicy;

    beforeEach(async () => {
      const adapter = new StringAdapter(
        `
                p, user:default/known_user, test.resource.deny, use, allow
        `,
      );
      const csvPermFile = resolve(__dirname, './test/data/rbac-policy.csv');
      const config = new ConfigReader({
        permission: {
          rbac: {
            'policies-csv-file': csvPermFile,
          },
        },
      });
      const theModel = newModelFromString(MODEL);
      const logger = getVoidLogger();
      const enf = await createEnforcer(
        theModel,
        adapter,
        logger,
        tokenManagerMock,
      );

      policy = await RBACPermissionPolicy.build(
        logger,
        config,
        conditionalStorage,
        enf,
      );

      catalogApi.getEntities.mockReturnValue({ items: [] });
    });

    // case1
    it('should allow read access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.read',
          'catalog-entity',
          'read',
        ),
        newIdentityResponse('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // case2
    it('should allow create access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('catalog.entity.create'),
        newIdentityResponse('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // case3
    it('should allow deny access to resource permission for user:default/known_user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource.deny'),
        newIdentityResponse('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // case1 with role
    it('should allow update access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.read',
          'catalog-entity',
          'update',
        ),
        newIdentityResponse('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // case2 with role
    it('should allow update access to resource permission for role from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.read',
          'catalog-entity',
          'update',
        ),
        newIdentityResponse('role:default/catalog-writer'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });
  });

  describe('Policy checks for users', () => {
    let policy: RBACPermissionPolicy;

    beforeEach(async () => {
      const adapter = new StringAdapter(
        `
                # basic type permission policies
                p, user:default/known_user, test.resource.deny, use, deny
                p, user:default/duplicated, test.resource, use, allow
                p, user:default/duplicated, test.resource, use, deny
                p, user:default/known_user, test.resource, use, allow

                # resource type permission policies
                p, user:default/known_user, test-resource-deny, update, deny 
                p, user:default/duplicated, test-resource, update, allow
                p, user:default/duplicated, test-resource, update, deny
                p, user:default/known_user, test-resource, update, allow 
                `,
      );
      const config = newConfigReader();
      const theModel = newModelFromString(MODEL);
      const logger = getVoidLogger();
      const enf = await createEnforcer(
        theModel,
        adapter,
        logger,
        tokenManagerMock,
      );

      policy = await RBACPermissionPolicy.build(
        logger,
        config,
        conditionalStorage,
        enf,
      );

      catalogApi.getEntities.mockReturnValue({ items: [] });
    });
    // +-------+------+------------------------+
    // | allow | deny |         result         |
    // +-------+------+------------------------+
    // | N     | Y    | deny                   | 1
    // | N     | N    | deny (user not listed) | 2
    // | Y     | Y    | deny (user:default/duplicated)      | 3
    // | Y     | N    | allow                  | 4

    // Tests for Resource basic type permission

    // case1
    it('should deny access to basic permission for listed user with deny action', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource.deny'),
        newIdentityResponse('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case2
    it('should deny access to basic permission for unlisted user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('unuser:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case3
    it('should deny access to basic permission for listed user deny and allow', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('user:default/duplicated'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case4
    it('should allow access to basic permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('user:default/known_user'),
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
        newIdentityResponse('user:default/known_user'),
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
        newIdentityResponse('unuser:default/known_user'),
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
        newIdentityResponse('user:default/duplicated'),
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
        newIdentityResponse('user:default/known_user'),
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
        newIdentityResponse('user:default/known_user'),
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
  });
});

describe('Policy checks for users and groups', () => {
  let policy: RBACPermissionPolicy;

  beforeEach(async () => {
    const adapter = new StringAdapter(
      `
      # basic type permission policies
      ### Let's deny 'use' action for 'test.resource' for group:default/data_admin
      p, group:default/data_admin, test.resource, use, deny
      
      # case1:
      # g, user:default/alice, group:default/data_admin
      p, user:default/alice, test.resource, use, allow
      
      # case2:
      # g, user:default/akira, group:default/data_admin
      
      # case3:
      # g, user:default/antey, group:default/data_admin
      p, user:default/antey, test.resource, use, deny
      
      ### Let's allow 'use' action for 'test.resource' for group:default/data_read_admin
      p, group:default/data_read_admin, test.resource, use, allow
      
      # case4:
      # g, user:default/julia, group:default/data_read_admin
      p, user:default/julia, test.resource, use, allow
      
      # case5:
      # g, user:default/mike, group:default/data_read_admin
      
      # case6:
      # g, user:default/tom, group:default/data_read_admin
      p, user:default/tom, test.resource, use, deny
      
      
      # resource type permission policies
      ### Let's deny 'read' action for 'test.resource' permission for group:default/data_admin
      p, group:default/data_admin, test-resource, read, deny
      
      # case1:
      # g, user:default/alice, group:default/data_admin
      p, user:default/alice, test-resource, read, allow
      
      # case2:
      # g, user:default/akira, group:default/data_admin
      
      # case3:
      # g, user:default/antey, group:default/data_admin
      p, user:default/antey, test-resource, read, deny
      
      ### Let's allow 'read' action for 'test-resource' permission for group:default/data_read_admin
      p, group:default/data_read_admin, test-resource, read, allow
      
      # case4:
      # g, user:default/julia, group:default/data_read_admin
      p, user:default/julia, test-resource, read, allow
      
      # case5:
      # g, user:default/mike, group:default/data_read_admin
      
      # case6:
      # g, user:default/tom, group:default/data_read_admin
      p, user:default/tom, test-resource, read, deny


      # group inheritance:
      # g, group:default/data-read-admin, group:default/data_parent_admin
      # and we know case5:
      # g, user:default/mike, data-read-admin
  
      p, group:default/data_parent_admin, test.resource.2, use, allow
      p, group:default/data_parent_admin, test-resource, create, allow
      `,
    );
    const config = newConfigReader();
    const theModel = newModelFromString(MODEL);
    const logger = getVoidLogger();
    const enf = await createEnforcer(
      theModel,
      adapter,
      logger,
      tokenManagerMock,
    );

    policy = await RBACPermissionPolicy.build(
      logger,
      config,
      conditionalStorage,
      enf,
    );

    catalogApi.getEntities.mockReset();
  });

  // User inherits permissions from groups and their parent groups.
  // This behavior can be configured with `policy_effect` in the model.
  // Also it can be customized using casbin function.
  // Test suite table:
  // +-------+---------+----------+-------+
  // | Group |  User   |  result  | case# |
  // +-------+---------+----------+-------+
  // | deny  |  allow  |  deny    |   1   | +
  // | deny  |    -    |  deny    |   2   | +
  // | deny  |  deny   |  deny    |   3   | +
  // +-------+---------+----------+-------+
  // | allow | allow   | allow    |   4   | +
  // | allow |   -     | allow    |   5   | +
  // | allow |  deny   | deny     |   6   |
  // +-------+---------+----------+-------+

  // Basic type permissions

  // case1
  it('should deny access to basic permission for user Alice with "allow" "use" action, when her group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/alice'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case2
  it('should deny access to basic permission for user Akira without("-") "use" action definition, when his group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/akira'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case3
  it('should deny access to basic permission for user Antey with "deny" "use" action definition, when his group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/antey'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case4
  it('should allow access to basic permission for user Julia with "allow" "use" action, when her group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/julia'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // case5
  it('should allow access to basic permission for user Mike without("-") "use" action definition, when his group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // case6
  it('should deny access to basic permission for user Tom with "deny" "use" action definition, when his group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/tom'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // inheritance case
  it('should allow access to basic permission to test.resource.2 for user Mike with "-" "use" action definition, when parent group of his group "allow" this action', async () => {
    const groupMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
      spec: {
        parent: 'group:default/data_parent_admin',
      },
    };

    const groupParentMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_parent_admin',
        namespace: 'default',
      },
    };

    catalogApi.getEntities.mockImplementation(arg => {
      const hasMember = arg.filter['relations.hasMember'];
      if (hasMember && hasMember[0] === 'user:default/mike') {
        return { items: [groupMock] };
      }
      const hasParent = arg.filter['relations.parentOf'];
      if (hasParent && hasParent[0] === 'group:default/data_read_admin') {
        return { items: [groupParentMock] };
      }
      return { items: [] };
    });

    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource.2'),
      newIdentityResponse('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // Resource type permissions

  // case1
  it('should deny access to basic permission for user Alice with "allow" "read" action, when her group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/alice'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case2
  it('should deny access to basic permission for user Akira without("-") "read" action definition, when his group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/akira'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case3
  it('should deny access to basic permission for user Antey with "deny" "read" action definition, when his group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/antey'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case4
  it('should allow access to basic permission for user Julia with "allow" "read" action, when her group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/julia'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // case5
  it('should allow access to basic permission for user Mike without("-") "read" action definition, when his group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // case6
  it('should deny access to basic permission for user Tom with "deny" "read" action definition, when his group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/tom'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // inheritance case
  it('should allow access to resource permission to test-resource for user Mike with "-" "write" action definition, when parent group of his group "allow" this action', async () => {
    const groupMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
      spec: {
        parent: 'group:default/data_parent_admin',
      },
    };

    const groupParentMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_parent_admin',
        namespace: 'default',
      },
    };

    catalogApi.getEntities.mockImplementation(arg => {
      const hasMember = arg.filter['relations.hasMember'];
      if (hasMember && hasMember[0] === 'user:default/mike') {
        return { items: [groupMock] };
      }
      const hasParent = arg.filter['relations.parentOf'];
      if (hasParent && hasParent[0] === 'group:default/data_read_admin') {
        return { items: [groupParentMock] };
      }
      return { items: [] };
    });

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.create',
        'test-resource',
        'create',
      ),
      newIdentityResponse('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });
});

function newPolicyQueryWithBasicPermission(name: string): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: {},
  });
  return { permission: mockPermission };
}

function newPolicyQueryWithResourcePermission(
  name: string,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete',
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
