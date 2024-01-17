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
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import { Logger } from 'winston';

import { RoleMetadata, Source } from '@janus-idp/backstage-plugin-rbac-common';

import { resolve } from 'path';

import {
  PermissionPolicyMetadataDao,
  PolicyMetadataStorage,
} from '../database/policy-metadata-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import { RBACPermissionPolicy } from './permission-policy';
import { BackstageRoleManager } from './role-manager';

type PermissionAction = 'create' | 'read' | 'update' | 'delete';

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

const roleMetadataStorageMock: RoleMetadataStorage = {
  findRoleMetadata: jest
    .fn()
    .mockImplementation(
      async (
        _roleEntityRef: string,
        _trx: Knex.Knex.Transaction,
      ): Promise<RoleMetadata> => {
        return { source: 'csv-file' };
      },
    ),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

const policyMetadataStorageMock: PolicyMetadataStorage = {
  findPolicyMetadataBySource: jest
    .fn()
    .mockImplementation(
      async (_source: Source): Promise<PermissionPolicyMetadataDao[]> => {
        return [];
      },
    ),
  findPolicyMetadata: jest.fn().mockImplementation(),
  createPolicyMetadata: jest.fn().mockImplementation(),
  removePolicyMetadata: jest.fn().mockImplementation(),
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
    const knex = Knex.knex({ client: MockClient });
    const enfDelegate = new EnforcerDelegate(
      enf,
      policyMetadataStorageMock,
      knex,
    );

    const policy = await RBACPermissionPolicy.build(
      logger,
      config,
      conditionalStorage,
      enfDelegate,
      roleMetadataStorageMock,
      knex,
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

      const knex = Knex.knex({ client: MockClient });
      // policyMetadataStorageMock.findPolicyMetadataBySource
      const enfDelegate = new EnforcerDelegate(
        enf,
        policyMetadataStorageMock,
        knex,
      );

      policy = await RBACPermissionPolicy.build(
        logger,
        config,
        conditionalStorage,
        enfDelegate,
        roleMetadataStorageMock,
        knex,
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
                # ========== basic type permission policies ========== #
                # case 1
                p, user:default/known_user, test.resource.deny, use, deny
                # case 2 is about user without listed permissions
                # case 3
                p, user:default/duplicated, test.resource, use, allow
                p, user:default/duplicated, test.resource, use, deny
                # case 4
                p, user:default/known_user, test.resource, use, allow

                # ========== resource type permission policies ========== #
                # case 1
                p, user:default/known_user, test-resource-deny, update, deny
                # case 2 is about user without listed permissions
                # case 3
                p, user:default/duplicated, test-resource, update, allow
                p, user:default/duplicated, test-resource, update, deny
                # case 4
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

      const knex = Knex.knex({ client: MockClient });
      const enfDelegate = new EnforcerDelegate(
        enf,
        policyMetadataStorageMock,
        knex,
      );

      policy = await RBACPermissionPolicy.build(
        logger,
        config,
        conditionalStorage,
        enfDelegate,
        roleMetadataStorageMock,
        knex,
      );

      catalogApi.getEntities.mockReturnValue({ items: [] });
    });
    // +-------+------+------------------------------------+
    // | allow | deny |         result                 |   |
    // +-------+------+--------------------------------+---|
    // | N     | Y    | deny                           | 1 |
    // | N     | N    | deny (user not listed)         | 2 |
    // | Y     | Y    | deny (user:default/duplicated) | 3 |
    // | Y     | N    | allow                          | 4 |

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
    it('should allow access to permission resources for admin added through app config', async () => {
      const adminPerm: {
        name: string;
        resource: string;
        action: PermissionAction;
      }[] = [
        {
          name: 'policy.entity.read',
          resource: 'policy-entity',
          action: 'read',
        },
        {
          name: 'policy.entity.create',
          resource: 'policy-entity',
          action: 'create',
        },
        {
          name: 'policy.entity.update',
          resource: 'policy-entity',
          action: 'update',
        },
        {
          name: 'policy.entity.delete',
          resource: 'policy-entity',
          action: 'delete',
        },
        {
          name: 'catalog.entity.read',
          resource: 'catalog-entity',
          action: 'read',
        },
      ];
      for (const perm of adminPerm) {
        const decision = await policy.handle(
          newPolicyQueryWithResourcePermission(
            perm.name,
            perm.resource,
            perm.action,
          ),
          newIdentityResponse('user:default/guest'),
        );
        expect(decision.result).toBe(AuthorizeResult.ALLOW);
      }
    });
  });
});

// Notice: There is corner case, when "resourced" permission policy can be defined not by resource type, but by name.
describe('Policy checks for resourced permissions defined by name', () => {
  async function createRBACPolicy(
    policyContent: string,
  ): Promise<RBACPermissionPolicy> {
    const adapter = new StringAdapter(policyContent);
    const config = new ConfigReader({});
    const theModel = newModelFromString(MODEL);
    const logger = getVoidLogger();
    const enf = await createEnforcer(
      theModel,
      adapter,
      logger,
      tokenManagerMock,
    );

    return await RBACPermissionPolicy.build(
      logger,
      config,
      conditionalStorage,
      enf,
    );
  }
  it('should allow access to resourced permission assigned by name', async () => {
    catalogApi.getEntities.mockReturnValue({ items: [] });

    const policy = await createRBACPolicy(`
      p, role:default/catalog_reader, catalog.entity.read, read, allow

      g, user:default/tor, role:default/catalog_reader
    `);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  it('should allow access to resourced permission assigned by name, because it has higher priority then permission for the same resource assigned by resource type', async () => {
    catalogApi.getEntities.mockReturnValue({ items: [] });

    const policy = await createRBACPolicy(`
      p, role:default/catalog_reader, catalog.entity.read, read, allow
      p, role:default/catalog_reader, catalog-entity, read, deny

      g, user:default/tor, role:default/catalog_reader
    `);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  it('should deny access to resourced permission assigned by name, because it has higher priority then permission for the same resource assigned by resource type', async () => {
    catalogApi.getEntities.mockReturnValue({ items: [] });

    const policy = await createRBACPolicy(`
      p, role:default/catalog_reader, catalog.entity.read, read, deny
      p, role:default/catalog_reader, catalog-entity, read, allow

      g, user:default/tor, role:default/catalog_reader
    `);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  it('should allow access to resourced permission assigned by name, but user inherits policy from his group', async () => {
    const groupEntityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'team-a',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockImplementation(arg => {
      const hasMember = arg.filter['relations.hasMember'];
      if (hasMember && hasMember[0] === 'user:default/tor') {
        return { items: [groupEntityMock] };
      }
      return { items: [] };
    });

    const policy = await createRBACPolicy(`
    p, role:default/catalog_user, catalog.entity.read, read, allow

    g, group:default/team-a, role:default/catalog_user
    `);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  it('should allow access to resourced permission assigned by name, but user inherits policy from few groups', async () => {
    const groupEntityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'team-a',
        namespace: 'default',
      },
      spec: {
        parent: 'team-b',
      },
    };
    const groupParentMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'team-b',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockImplementation(arg => {
      const hasMember = arg.filter['relations.hasMember'];
      if (hasMember && hasMember[0] === 'user:default/tor') {
        return { items: [groupEntityMock] };
      }
      const hasParent = arg.filter['relations.parentOf'];
      if (hasParent && hasParent[0] === 'group:default/team-a') {
        return { items: [groupParentMock] };
      }
      return { items: [] };
    });

    const policy = await createRBACPolicy(`
    p, role:default/catalog_user, catalog.entity.read, read, allow

    g, group:default/team-a, group:default/team-b
    g, group:default/team-b, role:default/catalog_user
    `);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
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

    const knex = Knex.knex({ client: MockClient });
    const enfDelegate = new EnforcerDelegate(
      enf,
      policyMetadataStorageMock,
      knex,
    );

    policy = await RBACPermissionPolicy.build(
      logger,
      config,
      conditionalStorage,
      enfDelegate,
      roleMetadataStorageMock,
      knex,
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
  action: PermissionAction,
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
